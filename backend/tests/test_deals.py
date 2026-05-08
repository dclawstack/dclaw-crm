import pytest
from uuid import UUID


@pytest.mark.asyncio
async def test_list_deals_empty(client):
    response = await client.get("/api/v1/deals/")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_create_deal(client):
    customer = await client.post("/api/v1/customers/", json={"name": "Acme", "email": "acme@example.com"})
    customer_id = customer.json()["id"]

    payload = {
        "customer_id": customer_id,
        "title": "Enterprise License",
        "value": 50000.0,
        "stage": "prospecting",
        "probability": 20,
    }
    response = await client.post("/api/v1/deals/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Enterprise License"
    assert data["customer_id"] == customer_id
    assert UUID(data["id"])


@pytest.mark.asyncio
async def test_get_deal(client):
    customer = await client.post("/api/v1/customers/", json={"name": "Beta", "email": "beta@example.com"})
    customer_id = customer.json()["id"]

    deal = await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Deal One",
        "value": 10000.0,
    })
    deal_id = deal.json()["id"]

    response = await client.get(f"/api/v1/deals/{deal_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Deal One"


@pytest.mark.asyncio
async def test_get_deal_not_found(client):
    response = await client.get("/api/v1/deals/123e4567-e89b-12d3-a456-426614174000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_deal(client):
    customer = await client.post("/api/v1/customers/", json={"name": "Gamma", "email": "gamma@example.com"})
    customer_id = customer.json()["id"]

    deal = await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Old Title",
        "value": 5000.0,
    })
    deal_id = deal.json()["id"]

    response = await client.put(f"/api/v1/deals/{deal_id}", json={"title": "New Title", "stage": "proposal"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["stage"] == "proposal"


@pytest.mark.asyncio
async def test_delete_deal(client):
    customer = await client.post("/api/v1/customers/", json={"name": "Delta", "email": "delta@example.com"})
    customer_id = customer.json()["id"]

    deal = await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "To Delete",
        "value": 1000.0,
    })
    deal_id = deal.json()["id"]

    response = await client.delete(f"/api/v1/deals/{deal_id}")
    assert response.status_code == 204

    get_resp = await client.get(f"/api/v1/deals/{deal_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_deals_by_stage(client):
    customer = await client.post("/api/v1/customers/", json={"name": "StageCo", "email": "stage@example.com"})
    customer_id = customer.json()["id"]

    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Deal A",
        "value": 1000.0,
        "stage": "proposal",
    })
    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Deal B",
        "value": 2000.0,
        "stage": "proposal",
    })
    await client.post("/api/v1/deals/", json={
        "customer_id": customer_id,
        "title": "Deal C",
        "value": 3000.0,
        "stage": "closed_won",
    })

    response = await client.get("/api/v1/deals/?stage=proposal")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    for item in data["items"]:
        assert item["stage"] == "proposal"
