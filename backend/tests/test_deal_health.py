import pytest


@pytest.mark.asyncio
async def test_deal_health_score(client):
    c = await client.post("/api/v1/customers/", json={"name": "HealthCo", "email": "health@co.com"})
    cid = c.json()["id"]
    d = await client.post("/api/v1/deals/", json={"customer_id": cid, "title": "Health Deal", "value": 1000, "probability": 50})
    did = d.json()["id"]
    resp = await client.get(f"/api/v1/deals/{did}/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert "signals" in data
    assert 0 <= data["score"] <= 100


@pytest.mark.asyncio
async def test_deal_health_with_activity(client):
    c = await client.post("/api/v1/customers/", json={"name": "HealthCo2", "email": "health2@co.com"})
    cid = c.json()["id"]
    d = await client.post("/api/v1/deals/", json={"customer_id": cid, "title": "H2 Deal", "value": 2000, "probability": 80})
    did = d.json()["id"]
    await client.post("/api/v1/activities/", json={
        "customer_id": cid, "deal_id": did,
        "activity_type": "call", "description": "Recent call",
    })
    resp = await client.get(f"/api/v1/deals/{did}/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] > 50
