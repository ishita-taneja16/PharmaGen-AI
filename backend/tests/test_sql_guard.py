import pytest
from app.utils.sql_guard import validate_sql_security
from app.core.exceptions import SQLSecurityException

def test_valid_select_query():
    sql = "SELECT title, yield_percentage FROM experiments WHERE yield_percentage > 90;"
    result = validate_sql_security(sql)
    assert "SELECT" in result

def test_invalid_drop_table():
    sql = "DROP TABLE experiments;"
    with pytest.raises(SQLSecurityException):
        validate_sql_security(sql)

def test_invalid_unauthorized_table():
    sql = "SELECT * FROM secret_passwords;"
    with pytest.raises(SQLSecurityException):
        validate_sql_security(sql)
