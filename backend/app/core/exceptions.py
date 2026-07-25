from fastapi import HTTPException, status

class PharmaAIException(HTTPException):
    def __init__(self, detail: str, error_code: str = "GENERIC_ERROR", status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class SQLSecurityException(PharmaAIException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, error_code="SQL_GUARD_VIOLATION", status_code=status.HTTP_403_FORBIDDEN)

class ComplianceViolationException(PharmaAIException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, error_code="COMPLIANCE_VIOLATION", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class PaperParsingException(PharmaAIException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, error_code="PAPER_PARSING_FAILED", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
