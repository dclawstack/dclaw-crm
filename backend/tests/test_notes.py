import pytest


@pytest.mark.asyncio
async def test_create_note_for_customer(client):
    c = await client.post("/api/v1/customers/", json={"name": "NoteUser", "email": "note@user.com"})
    cid = c.json()["id"]
    resp = await client.post("/api/v1/notes/", json={"content": "First note", "customer_id": cid})
    assert resp.status_code == 201
    assert resp.json()["content"] == "First note"
    assert resp.json()["customer_id"] == cid


@pytest.mark.asyncio
async def test_list_notes_by_customer(client):
    c = await client.post("/api/v1/customers/", json={"name": "N2", "email": "n2@user.com"})
    cid = c.json()["id"]
    await client.post("/api/v1/notes/", json={"content": "Note A", "customer_id": cid})
    await client.post("/api/v1/notes/", json={"content": "Note B", "customer_id": cid})
    resp = await client.get(f"/api/v1/notes/?customer_id={cid}")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


@pytest.mark.asyncio
async def test_update_note(client):
    c = await client.post("/api/v1/customers/", json={"name": "N3", "email": "n3@user.com"})
    cid = c.json()["id"]
    note = await client.post("/api/v1/notes/", json={"content": "Old", "customer_id": cid})
    nid = note.json()["id"]
    resp = await client.put(f"/api/v1/notes/{nid}", json={"content": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["content"] == "Updated"


@pytest.mark.asyncio
async def test_delete_note(client):
    c = await client.post("/api/v1/customers/", json={"name": "N4", "email": "n4@user.com"})
    cid = c.json()["id"]
    note = await client.post("/api/v1/notes/", json={"content": "Delete me", "customer_id": cid})
    nid = note.json()["id"]
    resp = await client.delete(f"/api/v1/notes/{nid}")
    assert resp.status_code == 204
    get_resp = await client.get(f"/api/v1/notes/{nid}")
    assert get_resp.status_code == 404
