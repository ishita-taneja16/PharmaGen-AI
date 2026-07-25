import pytest
import hashlib
import json

def test_sha256_audit_payload_hash():
    payload = {
        "report_id": "r-101",
        "experiment_id": "exp-202",
        "sop_code": "SOP-MFG-088",
        "compliance_score": 85.0
    }
    hash1 = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    hash2 = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    
    assert hash1 == hash2
    assert len(hash1) == 64
