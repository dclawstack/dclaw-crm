import pytest


@pytest.mark.asyncio
async def test_create_contact(client):
    c = await client.post("/api/v1/customers/", json={"name": "ContactCo", "email": "contact@co.com"})
    cid = c.json()["id"]
    resp = await client.post(
        f"/api/v1/customers/{cid}/contacts/",
        json={"customer_id": cid, "name": "Alice Smith", "email": "alice@co.com", "title": "CEO"},
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Alice Smith"


@pytest.mark.asyncio
async def test_list_contacts(client):
    c = await client.post("/api/v1/customers/", json={"name": "CC2", "email": "cc2@co.com"})
    cid = c.json()["id"]
    await client.post(f"/api/v1/customers/{cid}/contacts/", json={"customer_id": cid, "name": "Bob"})
    await client.post(f"/api/v1/customers/{cid}/contacts/", json={"customer_id": cid, "name": "Carol"})
    resp = await client.get(f"/api/v1/customers/{cid}/contacts/")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


@pytest.mark.asyncio
async def test_update_contact(client):
    c = await client.post("/api/v1/customers/", json={"name": "CC3", "email": "cc3@co.com"})
    cid = c.json()["id"]
    contact = await client.post(f"/api/v1/customers/{cid}/contacts/", json={"customer_id": cid, "name": "Dave"})
    contact_id = contact.json()["id"]
    resp = await client.put(f"/api/v1/contacts/{contact_id}", json={"name": "David", "title": "CTO"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "David"


@pytest.mark.asyncio
async def test_delete_contact(client):
    c = await client.post("/api/v1/customers/", json={"name": "CC4", "email": "cc4@co.com"})
    cid = c.json()["id"]
    contact = await client.post(f"/api/v1/customers/{cid}/contacts/", json={"customer_id": cid, "name": "Eve"})
    contact_id = contact.json()["id"]
    resp = await client.delete(f"/api/v1/contacts/{contact_id}")
    assert resp.status_code == 204
