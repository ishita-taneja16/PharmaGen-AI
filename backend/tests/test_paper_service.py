import pytest
from app.services.paper_service import PaperService

def test_extract_keywords_yake():
    sample_text = "The dissolution kinetics of active pharmaceutical ingredient formulation X-402 were evaluated using USP Apparatus II at 37°C."
    keywords = PaperService.extract_keywords_yake(sample_text, max_keywords=5)
    assert len(keywords) > 0
    assert any("formulation" in k["keyword"].lower() or "dissolution" in k["keyword"].lower() for k in keywords)

def test_extract_citations_doi():
    sample_text = "Refer to studies published in 10.1016/j.xpharm.2025.04.012 and (Vance et al., 2024)."
    citations = PaperService.extract_citations(sample_text)
    assert len(citations) >= 2
    assert any(c["type"] == "DOI" for c in citations)
    assert any(c["type"] == "AUTHOR_YEAR" for c in citations)
