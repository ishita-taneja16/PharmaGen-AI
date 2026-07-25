import pytest
from app.utils.sql_guard import validate_sql_security
from app.core.exceptions import SQLSecurityException

def test_sqlglot_cte_validation():
    sql = "WITH top_yields AS (SELECT formulation_code, AVG(yield_percentage) as avg_yield FROM experiments GROUP BY formulation_code) SELECT * FROM top_yields;"
    validated = validate_sql_security(sql)
    assert "WITH" in validated

def test_sqlglot_window_function_validation():
    sql = "SELECT formulation_code, yield_percentage, RANK() OVER (ORDER BY yield_percentage DESC) FROM experiments;"
    validated = validate_sql_security(sql)
    assert "RANK()" in validated

def test_sqlglot_blocks_update_and_delete():
    sql = "DELETE FROM experiments WHERE yield_percentage < 50;"
    with pytest.raises(SQLSecurityException):
        validate_sql_security(sql)
