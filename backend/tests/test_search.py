import pytest


@pytest.mark.asyncio
async def test_search_empty(client):
    response = await client.get("/api/v1/search/?q=notfound")
    assert response.status_code == 200
    assert response.json()["results"] == []


@pytest.mark.asyncio
async def test_search_customers(client):
    await client.post("/api/v1/customers/", json={"name": "Searchable Corp", "email": "search@corp.com", "company": "SearchCo"})
    response = await client.get("/api/v1/search/?q=Searchable")
    assert response.status_code == 200
    results = response.json()["results"]
    assert any(r["type"] == "customer" and "Searchable" in r["title"] for r in results)


@pytest.mark.asyncio
async def test_search_deals(client):
    c = await client.post("/api/v1/customers/", json={"name": "X", "email": "x@x.com"})
    cid = c.json()["id"]
    await client.post("/api/v1/deals/", json={"customer_id": cid, "title": "BigDeal Enterprise", "value": 5000})
    response = await client.get("/api/v1/search/?q=BigDeal")
    assert response.status_code == 200
    results = response.json()["results"]
    assert any(r["type"] == "deal" for r in results)
