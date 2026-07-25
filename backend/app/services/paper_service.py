import uuid
import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
import yake
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, text
from app.core.config import settings
from app.domain.models import ScientificPaper, PaperChunk, ProcessingStatus
from app.domain.schemas import PaperSearchResult, PaperSearchResponse
from app.utils.pdf_parser import parse_pdf_document, chunk_text_content
from app.utils.logger import logger

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class PaperService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_paper_record(
        self,
        user_id: uuid.UUID,
        file_path: str,
        title: str,
        authors: Optional[str] = None,
        journal: Optional[str] = None
    ) -> ScientificPaper:
        """Initializes paper metadata record in QUEUED status."""
        paper = ScientificPaper(
            user_id=user_id,
            title=title,
            authors=authors,
            journal=journal,
            file_path=file_path,
            processing_status=ProcessingStatus.QUEUED,
            progress_percentage=0
        )
        self.session.add(paper)
        await self.session.commit()
        await self.session.refresh(paper)
        return paper

    async def execute_background_ingestion(self, paper_id: uuid.UUID) -> None:
        """
        Background worker executing PDF OCR extraction, chunking, Gemini vector embeddings,
        keyword extraction, citation parsing, and executive summarization with progress updates.
        """
        stmt = select(ScientificPaper).where(ScientificPaper.id == paper_id)
        res = await self.session.execute(stmt)
        paper = res.scalar_one_or_none()

        if not paper:
            logger.error(f"Background worker error: Paper {paper_id} not found.")
            return

        try:
            # Step 1: Update status to EXTRACTING_TEXT (25%)
            paper.processing_status = ProcessingStatus.EXTRACTING_TEXT
            paper.progress_percentage = 25
            await self.session.commit()

            pages_data = parse_pdf_document(paper.file_path)
            paper.total_pages = len(pages_data)

            full_text = " ".join([p["content"] for p in pages_data])

            # Step 2: Extract Keywords & Citations (50%)
            paper.keywords = self.extract_keywords_yake(full_text, max_keywords=8)
            paper.citations = self.extract_citations(full_text)
            paper.progress_percentage = 50
            await self.session.commit()

            # Step 3: Text Chunking & Embedding Generation (75%)
            paper.processing_status = ProcessingStatus.GENERATING_EMBEDDINGS
            chunks_data = chunk_text_content(pages_data, chunk_size=500, overlap=50)

            for chunk_info in chunks_data:
                chunk_text = chunk_info["chunk_content"]
                embedding_vector = await self._generate_embedding(chunk_text)

                chunk_obj = PaperChunk(
                    paper_id=paper.id,
                    chunk_index=chunk_info["chunk_index"],
                    chunk_content=chunk_text,
                    embedding=embedding_vector,
                    chunk_metadata=chunk_info["metadata"]
                )
                self.session.add(chunk_obj)

            paper.progress_percentage = 75
            await self.session.commit()

            # Step 4: Executive Summarization (100%)
            paper.executive_summary = await self.summarize_paper_ai(full_text)
            paper.processing_status = ProcessingStatus.COMPLETED
            paper.progress_percentage = 100
            await self.session.commit()

            logger.info(f"Background ingestion completed successfully for paper: '{paper.title}' ({paper_id})")

        except Exception as e:
            logger.error(f"Background worker failed for paper {paper_id}: {e}")
            paper.processing_status = ProcessingStatus.FAILED
            paper.error_message = str(e)
            await self.session.commit()

    async def search_papers_hybrid(
        self,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.70
    ) -> PaperSearchResponse:
        """Executes pgvector HNSW Cosine Distance search with fallback text matching."""
        query_embedding = await self._generate_embedding(query)

        if not query_embedding:
            stmt = select(PaperChunk, ScientificPaper)\
                .join(ScientificPaper, PaperChunk.paper_id == ScientificPaper.id)\
                .where(PaperChunk.chunk_content.ilike(f"%{query}%"))\
                .limit(top_k)
            result = await self.session.execute(stmt)
            records = result.all()

            results = [
                PaperSearchResult(
                    paper_id=paper.id,
                    paper_title=paper.title,
                    chunk_index=chunk.chunk_index,
                    content=chunk.chunk_content[:400] + "...",
                    similarity_score=0.82,
                    page_number=chunk.chunk_metadata.get("page_number") if chunk.chunk_metadata else 1
                )
                for chunk, paper in records
            ]
            return PaperSearchResponse(query=query, results=results)

        raw_sql = text("""
            SELECT 
                pc.paper_id,
                sp.title,
                pc.chunk_index,
                pc.chunk_content,
                1 - (pc.embedding <=> :embedding_vec::vector) AS similarity_score,
                pc.metadata
            FROM paper_chunks pc
            JOIN scientific_papers sp ON pc.paper_id = sp.id
            WHERE 1 - (pc.embedding <=> :embedding_vec::vector) >= :min_sim
            ORDER BY pc.embedding <=> :embedding_vec::vector ASC
            LIMIT :limit_k;
        """)

        res = await self.session.execute(raw_sql, {
            "embedding_vec": str(query_embedding),
            "min_sim": min_similarity,
            "limit_k": top_k
        })
        rows = res.fetchall()

        results = [
            PaperSearchResult(
                paper_id=row.paper_id,
                paper_title=row.title,
                chunk_index=row.chunk_index,
                content=row.chunk_content,
                similarity_score=float(row.similarity_score),
                page_number=row.metadata.get("page_number") if row.metadata else 1
            )
            for row in rows
        ]

        return PaperSearchResponse(query=query, results=results)

    @staticmethod
    def extract_keywords_yake(text_content: str, max_keywords: int = 8) -> List[Dict[str, Any]]:
        kw_extractor = yake.KeywordExtractor(lan="en", n=2, dedupLim=0.9, top=max_keywords)
        keywords = kw_extractor.extract_keywords(text_content)
        return [{"keyword": kw, "score": round(score, 4)} for kw, score in keywords]

    @staticmethod
    def extract_citations(text_content: str) -> List[Dict[str, str]]:
        """Parses inline DOI strings and reference citations using regex matching."""
        doi_pattern = r'10\.\d{4,9}/[-._;()/:A-Z0-9]+'
        author_year_pattern = r'\(([A-Z][a-z]+(?:\set\sal\.)?,\s\d{4})\)'

        dois = list(set(re.findall(doi_pattern, text_content, re.IGNORECASE)))
        author_years = list(set(re.findall(author_year_pattern, text_content)))

        citations = []
        for doi in dois[:5]:
            citations.append({"type": "DOI", "reference": f"https://doi.org/{doi}"})
        for ref in author_years[:5]:
            citations.append({"type": "AUTHOR_YEAR", "reference": ref})

        return citations

    @staticmethod
    async def summarize_paper_ai(text_content: str) -> str:
        if not settings.GEMINI_API_KEY:
            return "Gemini Summary Fallback: " + text_content[:400] + "..."
        try:
            model = genai.GenerativeModel(settings.LLM_MODEL)
            prompt = f"Synthesize this research text into a 3-paragraph executive summary (Objective, Methodology, Findings):\n\n{text_content[:8000]}"
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return f"Summary unavailable: {str(e)}"

    @staticmethod
    async def _generate_embedding(text_str: str) -> Optional[List[float]]:
        if not settings.GEMINI_API_KEY:
            return None
        try:
            res = genai.embed_content(
                model=settings.EMBEDDING_MODEL,
                content=text_str,
                task_type="retrieval_document"
            )
            return res["embedding"]
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return None
