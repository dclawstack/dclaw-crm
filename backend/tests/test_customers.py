import pytest
from uuid import UUID


@pytest.mark.asyncio
async def test_list_customers_empty(client):
    response = await client.get("/api/v1/customers/")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_create_customer(client):
    payload = {
        "name": "Alice Corp",
        "email": "alice@example.com",
        "phone": "+1234567890",
        "company": "Alice Inc",
        "status": "lead",
        "notes": "Initial contact",
    }
    response = await client.post("/api/v1/customers/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Alice Corp"
    assert data["email"] == "alice@example.com"
    assert UUID(data["id"])


@pytest.mark.asyncio
async def test_get_customer(client):
    payload = {"name": "Bob", "email": "bob@example.com"}
    create_resp = await client.post("/api/v1/customers/", json=payload)
    customer_id = create_resp.json()["id"]

    response = await client.get(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "bob@example.com"


@pytest.mark.asyncio
async def test_get_customer_not_found(client):
    response = await client.get("/api/v1/customers/123e4567-e89b-12d3-a456-426614174000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_customer(client):
    payload = {"name": "Charlie", "email": "charlie@example.com"}
    create_resp = await client.post("/api/v1/customers/", json=payload)
    customer_id = create_resp.json()["id"]

    update_payload = {"name": "Charles", "status": "active"}
    response = await client.put(f"/api/v1/customers/{customer_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Charles"
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_delete_customer(client):
    payload = {"name": "Dave", "email": "dave@example.com"}
    create_resp = await client.post("/api/v1/customers/", json=payload)
    customer_id = create_resp.json()["id"]

    response = await client.delete(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 204

    get_resp = await client.get(f"/api/v1/customers/{customer_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_customer_duplicate_email(client):
    payload = {"name": "Eve", "email": "eve@example.com"}
    response1 = await client.post("/api/v1/customers/", json=payload)
    assert response1.status_code == 201

    response2 = await client.post("/api/v1/customers/", json=payload)
    assert response2.status_code == 409
