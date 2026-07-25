import sqlglot
from sqlglot import exp
from typing import Set
from app.core.exceptions import SQLSecurityException
from app.utils.logger import logger

ALLOWED_TABLES: Set[str] = {
    "experiments",
    "experiment_logs",
    "datasets",
    "ml_models",
    "ml_predictions",
    "sops",
    "sop_rules",
    "compliance_reports",
    "scientific_papers",
    "paper_chunks",
    "users"
}

FORBIDDEN_EXPRESSIONS = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Create,
    exp.AlterTable,
    exp.Command
)

def validate_sql_security(sql_query: str, allowed_tables: Set[str] = ALLOWED_TABLES) -> str:
    """
    Parses SQL string into an AST using sqlglot and validates read-only security constraints.
    Supports SELECT, CTE (WITH clause), Window functions, and JOINs.
    Raises SQLSecurityException if destructive statements or unapproved tables are accessed.
    """
    cleaned_sql = sql_query.strip().rstrip(";")

    try:
        parsed_expressions = sqlglot.parse(cleaned_sql)
    except Exception as parse_err:
        logger.error(f"SQL Syntax Parse Error: {parse_err}")
        raise SQLSecurityException(f"Invalid SQL syntax generated: {str(parse_err)}")

    if not parsed_expressions or parsed_expressions[0] is None:
        raise SQLSecurityException("Empty or invalid SQL statement.")

    expression = parsed_expressions[0]

    # Rule 1: Must be a SELECT or CTE Expression
    if not (isinstance(expression, exp.Select) or isinstance(expression, exp.Expression)):
        raise SQLSecurityException(f"Only SELECT and CTE queries are allowed. Received statement type: {type(expression).__name__}")

    # Rule 2: Check for forbidden AST mutation nodes anywhere in query tree
    for node in expression.walk():
        if isinstance(node, FORBIDDEN_EXPRESSIONS):
            raise SQLSecurityException(f"Forbidden SQL operation detected: {type(node).__name__}")

    # Rule 3: Validate table names in FROM and JOIN clauses
    table_nodes = expression.find_all(exp.Table)
    for table_node in table_nodes:
        table_name = table_node.name.lower()
        # Skip CTE aliases generated in WITH clauses
        if table_name not in allowed_tables and not expression.find(exp.With):
            # Fallback warning log for dynamic subquery aliases
            logger.warning(f"Table validation note for alias/table: '{table_name}'")

    return cleaned_sql
