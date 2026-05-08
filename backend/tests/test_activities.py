import pytest
from uuid import UUID


@pytest.mark.asyncio
async def test_list_activities_empty(client):
    response = await client.get("/api/v1/activities/")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_create_activity(client):
    customer = await client.post("/api/v1/customers/", json={"name": "ActCo", "email": "act@example.com"})
    customer_id = customer.json()["id"]

    payload = {
        "customer_id": customer_id,
        "activity_type": "call",
        "description": "Initial call",
        "completed": False,
    }
    response = await client.post("/api/v1/activities/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["activity_type"] == "call"
    assert data["description"] == "Initial call"
    assert UUID(data["id"])


@pytest.mark.asyncio
async def test_get_activity(client):
    customer = await client.post("/api/v1/customers/", json={"name": "ActGet", "email": "actget@example.com"})
    customer_id = customer.json()["id"]

    activity = await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "email",
        "description": "Sent proposal",
    })
    activity_id = activity.json()["id"]

    response = await client.get(f"/api/v1/activities/{activity_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Sent proposal"


@pytest.mark.asyncio
async def test_get_activity_not_found(client):
    response = await client.get("/api/v1/activities/123e4567-e89b-12d3-a456-426614174000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_activity(client):
    customer = await client.post("/api/v1/customers/", json={"name": "ActUp", "email": "actup@example.com"})
    customer_id = customer.json()["id"]

    activity = await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "meeting",
        "description": "Scheduled",
        "completed": False,
    })
    activity_id = activity.json()["id"]

    response = await client.put(f"/api/v1/activities/{activity_id}", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


@pytest.mark.asyncio
async def test_delete_activity(client):
    customer = await client.post("/api/v1/customers/", json={"name": "ActDel", "email": "actdel@example.com"})
    customer_id = customer.json()["id"]

    activity = await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "note",
        "description": "To delete",
    })
    activity_id = activity.json()["id"]

    response = await client.delete(f"/api/v1/activities/{activity_id}")
    assert response.status_code == 204

    get_resp = await client.get(f"/api/v1/activities/{activity_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_activities_by_customer(client):
    customer = await client.post("/api/v1/customers/", json={"name": "ActList", "email": "actlist@example.com"})
    customer_id = customer.json()["id"]

    await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "call",
        "description": "Call 1",
    })
    await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "activity_type": "email",
        "description": "Email 1",
    })

    response = await client.get(f"/api/v1/activities/?customer_id={customer_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_list_activities_by_deal(client):
    customer = await client.post("/api/v1/customers/", json={"name": "DealAct", "email": "dealact@example.com"})
    customer_id = customer.json()["id"]

    deal = await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Deal for activity",
        "value": 5000.0,
    })
    deal_id = deal.json()["id"]

    await client.post("/api/v1/activities/", json={
        "customer_id": customer_id,
        "deal_id": deal_id,
        "activity_type": "meeting",
        "description": "Deal meeting",
    })

    response = await client.get(f"/api/v1/activities/?deal_id={deal_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["deal_id"] == deal_id
