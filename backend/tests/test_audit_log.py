import pytest


@pytest.mark.asyncio
async def test_audit_log_on_customer_create(client):
    await client.post("/api/v1/customers/", json={"name": "AuditUser", "email": "audit@test.com"})
    resp = await client.get("/api/v1/audit-log/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any(e["entity_type"] == "customer" and e["action"] == "created" for e in data["items"])


@pytest.mark.asyncio
async def test_audit_log_on_customer_status_change(client):
    c = await client.post("/api/v1/customers/", json={"name": "StatusUser", "email": "status@test.com"})
    cid = c.json()["id"]
    await client.patch(f"/api/v1/customers/{cid}/status?status=active")
    resp = await client.get(f"/api/v1/audit-log/?entity_type=customer&entity_id={cid}")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert any(e["field_name"] == "status" for e in items)


@pytest.mark.asyncio
async def test_audit_log_on_deal_stage_change(client):
    c = await client.post("/api/v1/customers/", json={"name": "DealAudit", "email": "dealaudit@test.com"})
    cid = c.json()["id"]
    d = await client.post("/api/v1/deals/", json={"customer_id": cid, "title": "Audit Deal", "value": 100})
    did = d.json()["id"]
    await client.patch(f"/api/v1/deals/{did}/stage?stage=qualification")
    resp = await client.get(f"/api/v1/audit-log/?entity_type=deal&entity_id={did}")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert any(e["field_name"] == "stage" for e in items)
