import pytest


@pytest.mark.asyncio
async def test_dashboard_empty(client):
    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 0
    assert data["open_deals"] == 0
    assert data["total_pipeline_value"] == 0.0
    assert data["win_rate"] == 0.0
    assert data["deals_by_stage"]["prospecting"] == 0
    assert data["recent_activities"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client):
    customer = await client.post("/api/v1/customers/", json={"name": "DashCo", "email": "dash@example.com"})
    customer_id = customer.json()["id"]

    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Open Deal",
        "value": 10000.0,
        "stage": "prospecting",
    })
    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Won Deal",
        "value": 5000.0,
        "stage": "closed_won",
    })
    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Lost Deal",
        "value": 3000.0,
        "stage": "closed_lost",
    })
    await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "call",
        "description": "Follow-up call",
    })

    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 1
    assert data["open_deals"] == 1
    assert data["total_pipeline_value"] == 10000.0
    assert data["win_rate"] == 50.0
    assert data["deals_by_stage"]["prospecting"] == 1
    assert data["deals_by_stage"]["closed_won"] == 1
    assert data["deals_by_stage"]["closed_lost"] == 1
    assert len(data["recent_activities"]) == 1
