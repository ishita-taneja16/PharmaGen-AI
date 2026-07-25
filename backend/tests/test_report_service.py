import os
import pytest
from app.services.report_service import ReportService

def test_generate_pdf_report(tmp_path):
    pdf_path = os.path.join(tmp_path, "test_report.pdf")
    res = ReportService.generate_pdf_report(pdf_path, "Test R&D Synthesis Report", {})
    assert os.path.exists(res)
    assert os.path.getsize(res) > 0

def test_generate_excel_report(tmp_path):
    excel_path = os.path.join(tmp_path, "test_data.xlsx")
    res = ReportService.generate_excel_report(excel_path, "Test Excel Report")
    assert os.path.exists(res)
    assert os.path.getsize(res) > 0

def test_generate_pptx_report(tmp_path):
    pptx_path = os.path.join(tmp_path, "test_deck.pptx")
    res = ReportService.generate_pptx_report(pptx_path, "Test PowerPoint Presentation")
    assert os.path.exists(res)
    assert os.path.getsize(res) > 0
