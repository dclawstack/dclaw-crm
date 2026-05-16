import httpx
from app.core.config import settings


async def enrich_company(company: str, domain: str | None = None) -> dict:
    if not settings.clearbit_api_key:
        return {"status": "no_data", "enriched_fields": []}

    lookup = domain or company.lower().replace(" ", "") + ".com"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://company.clearbit.com/v2/companies/find?domain={lookup}",
                headers={"Authorization": f"Bearer {settings.clearbit_api_key}"},
            )
            if resp.status_code != 200:
                return {"status": "no_data", "enriched_fields": []}
            data = resp.json()
            fields = {}
            if data.get("name"):
                fields["company"] = data["name"]
            if data.get("category", {}).get("industry"):
                fields["industry"] = data["category"]["industry"]
            if data.get("metrics", {}).get("employees"):
                fields["employee_count"] = str(data["metrics"]["employees"])
            if data.get("url"):
                fields["website"] = data["url"]
            if data.get("description"):
                fields["description"] = data["description"]
            return {"status": "completed", "enriched_fields": list(fields.keys()), "data": fields}
    except Exception:
        return {"status": "no_data", "enriched_fields": []}
