import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token

def test_password_hashing():
    raw_password = "SuperPharmaSecret123!"
    hashed = get_password_hash(raw_password)
    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_access_token_creation_and_decoding():
    user_id = "a3b8c9d0-1234-4567-89ab-cdef01234567"
    token = create_access_token(subject=user_id)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "access"

def test_refresh_token_creation():
    user_id = "a3b8c9d0-1234-4567-89ab-cdef01234567"
    token = create_refresh_token(subject=user_id)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"
