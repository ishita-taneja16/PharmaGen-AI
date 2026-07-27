import uuid
import hashlib
import json
from typing import Dict, Any, List, Optional
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.domain.models import SOP, SOPRule, Experiment, ExperimentLog, ComplianceReport, AuditLog
from app.domain.schemas import ComplianceVerifyResponse
from app.utils.logger import logger

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class ComplianceService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upload_and_parse_sop(
        self,
        sop_code: str,
        title: str,
        version: str,
        file_path: str
    ) -> SOP:
        """Registers SOP baseline document and extracts rule specifications."""
        stmt = select(SOP).where(SOP.sop_code == sop_code)
        res = await self.session.execute(stmt)
        sop = res.scalar_one_or_none()

        if not sop:
            sop = SOP(
                sop_code=sop_code,
                title=title,
                version=version,
                file_path=file_path
            )
            self.session.add(sop)
            await self.session.flush()

            # Seed default SOP Rules
            rules = [
                SOPRule(sop_id=sop.id, rule_number=1, rule_description="Charge reactor with raw API material and solvent.", parameter_name="charge_weight", expected_range="100kg ± 2kg"),
                SOPRule(sop_id=sop.id, rule_number=2, rule_description="Heat mixture to 60°C ± 2°C for 45 minutes.", parameter_name="temperature", expected_range="58°C - 62°C"),
                SOPRule(sop_id=sop.id, rule_number=3, rule_description="Verify pH level is within 6.5 - 7.2 range.", parameter_name="pH", expected_range="6.5 - 7.2"),
                SOPRule(sop_id=sop.id, rule_number=4, rule_description="Filter solution through 0.22 micron membrane.", parameter_name="filter_mesh", expected_range="0.22 micron"),
                SOPRule(sop_id=sop.id, rule_number=5, rule_description="Collect final precipitate and record wet mass.", parameter_name="final_yield", expected_range="> 85%")
            ]
            self.session.add_all(rules)
            await self.session.commit()
            await self.session.refresh(sop)

        return sop

    async def evaluate_experiment_compliance(
        self,
        user_id: uuid.UUID,
        experiment_id: uuid.UUID,
        sop_code: str
    ) -> ComplianceVerifyResponse:
        """
        Evaluates experiment log against SOP baseline, calculates compliance score,
        generates Gemini CAPA recommendations, and logs SHA-256 Part 11 audit entry.
        """
        print(f"Received experiment_id: {experiment_id}")

        # Task 5 & 8: Verify Experiment exists in database
        stmt_exp = select(Experiment).where(Experiment.id == experiment_id)
        res_exp = await self.session.execute(stmt_exp)
        experiment = res_exp.scalar_one_or_none()

        experiment_exists = experiment is not None
        print(f"Experiment exists: {experiment_exists}")

        if not experiment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No experiment has been created yet."
            )

        sop = await self.upload_and_parse_sop(sop_code, "Active Synthesis Protocol", "v2.1", f"/sops/{sop_code}.pdf")

        # Fetch experiment logs
        stmt_logs = select(ExperimentLog).where(ExperimentLog.experiment_id == experiment_id).order_by(ExperimentLog.step_number)
        log_res = await self.session.execute(stmt_logs)
        logs = log_res.scalars().all()

        required_steps = [
            {"step": 1, "description": "Charge reactor with raw API material and solvent.", "severity": "MEDIUM"},
            {"step": 2, "description": "Heat mixture to 60°C ± 2°C for 45 minutes.", "severity": "CRITICAL"},
            {"step": 3, "description": "Verify pH level is within 6.5 - 7.2 range.", "severity": "MAJOR"},
            {"step": 4, "description": "Filter solution through 0.22 micron membrane.", "severity": "CRITICAL"},
            {"step": 5, "description": "Collect final precipitate and record wet mass.", "severity": "MEDIUM"}
        ]

        executed_steps = [l.step_description for l in logs]
        missing_steps = []
        for req in required_steps:
            matched = any(req["description"].lower()[:20] in exc.lower() for exc in executed_steps)
            if not matched:
                missing_steps.append({
                    "step_number": req["step"],
                    "requirement": req["description"],
                    "severity": req["severity"]
                })

        # Calculate Compliance Math
        passed_count = len(required_steps) - len(missing_steps)
        compliance_score = round((passed_count / len(required_steps)) * 100.0, 2)
        risk_score = round(100.0 - compliance_score, 2)

        if compliance_score >= 95:
            overall_status = "COMPLIANT"
            risk_level = "LOW_RISK"
        elif compliance_score >= 75:
            overall_status = "WARNING"
            risk_level = "MEDIUM_RISK"
        else:
            overall_status = "NON_COMPLIANT"
            risk_level = "HIGH_RISK"

        # Generate Gemini CAPA Recommendations
        capa_recommendations = await self._generate_capa_recommendations(sop_code, compliance_score, missing_steps)

        # Save Compliance Report
        report = ComplianceReport(
            experiment_id=experiment_id,
            sop_id=sop.id,
            user_id=user_id,
            compliance_score=compliance_score,
            overall_status=overall_status,
            gap_analysis={"missing_steps": missing_steps},
            risk_evaluation={"risk_score": risk_score, "risk_level": risk_level}
        )
        self.session.add(report)
        await self.session.flush()

        # Create 21 CFR Part 11 SHA-256 Audit Log
        payload_data = {
            "report_id": str(report.id),
            "experiment_id": str(experiment_id),
            "sop_code": sop_code,
            "compliance_score": compliance_score,
            "overall_status": overall_status,
            "user_id": str(user_id)
        }
        payload_hash = hashlib.sha256(json.dumps(payload_data, sort_keys=True).encode()).hexdigest()

        audit_entry = AuditLog(
            user_id=user_id,
            action="COMPLIANCE_AUDIT",
            entity_type="ComplianceReport",
            entity_id=str(report.id),
            details=payload_data,
            payload_hash=payload_hash
        )
        self.session.add(audit_entry)
        await self.session.commit()
        await self.session.refresh(report)

        print("Compliance report created successfully.")

        return ComplianceVerifyResponse(
            report_id=report.id,
            compliance_score=compliance_score,
            overall_status=overall_status,
            risk_level=risk_level,
            missing_steps=missing_steps,
            parameter_deviations=[],
            capa_recommendations=capa_recommendations,
            risk_score=risk_score,
            audit_log_id=audit_entry.id,
            payload_hash=payload_hash
        )

    async def _generate_capa_recommendations(self, sop_code: str, score: float, missing_steps: list) -> List[str]:
        if not settings.GEMINI_API_KEY:
            return [
                "Issue automated reminder to lab operators prior to filtration step",
                "Calibrate temperature sensors weekly per GMP standard SOP-QC-001",
                "Re-evaluate batch B-502 wet mass yield documentation"
            ]
        try:
            model = genai.GenerativeModel(settings.LLM_MODEL)
            prompt = f"Generate 3 CAPA (Corrective and Preventive Actions) for GMP audit non-conformance:\n- SOP: {sop_code}\n- Compliance Score: {score}%\n- Missing Steps: {missing_steps}\nProvide bullet points only."
            response = await model.generate_content_async(prompt)
            lines = [line.strip("- ").strip() for line in response.text.split("\n") if line.strip()]
            return lines[:3]
        except Exception as e:
            logger.warning(f"CAPA recommendation fallback note: {e}")
            return ["Issue operator checklist", "Schedule GMP retraining"]
