import pytest


@pytest.mark.asyncio
async def test_create_webhook(client):
    resp = await client.post("/api/v1/webhooks/", json={
        "url": "https://example.com/hook",
        "events": ["customer.created", "deal.created"],
        "secret": "mysecret",
        "active": True,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["url"] == "https://example.com/hook"
    assert "customer.created" in data["events"]


@pytest.mark.asyncio
async def test_list_webhooks(client):
    await client.post("/api/v1/webhooks/", json={
        "url": "https://example.com/hook2",
        "events": ["deal.stage_changed"],
        "secret": "secret2",
    })
    resp = await client.get("/api/v1/webhooks/")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.asyncio
async def test_delete_webhook(client):
    create_resp = await client.post("/api/v1/webhooks/", json={
        "url": "https://example.com/hook3",
        "events": ["activity.created"],
        "secret": "secret3",
    })
    wid = create_resp.json()["id"]
    resp = await client.delete(f"/api/v1/webhooks/{wid}")
    assert resp.status_code == 204
