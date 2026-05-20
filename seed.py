#!/usr/bin/env python3
"""Seed script — populates DClaw CRM with realistic demo data."""
import requests, json, random
from datetime import date, timedelta

BASE = "http://localhost:8095/api/v1"

# ── Auth ──────────────────────────────────────────────────────────────────────
def get_token():
    r = requests.post(f"{BASE}/auth/login", json={"email": "satish@dclaw.com", "password": "admin123"})
    if r.status_code != 200:
        # try register
        r = requests.post(f"{BASE}/auth/register", json={"email": "satish@dclaw.com", "password": "admin123", "role": "admin"})
    return r.json()["access_token"]

TOKEN = get_token()
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def post(path, data): return requests.post(f"{BASE}{path}", json=data, headers=H)
def patch(path, params=None): return requests.patch(f"{BASE}{path}", params=params, headers=H)

# ── Customers ─────────────────────────────────────────────────────────────────
CUSTOMERS = [
    {"name": "Acme Corp",       "email": "hello@acme.com",       "phone": "+1-415-555-0101", "company": "Acme Corp",       "status": "active"},
    {"name": "TechNova Inc",    "email": "sales@technova.io",     "phone": "+1-628-555-0182", "company": "TechNova Inc",    "status": "active"},
    {"name": "GreenLeaf Ltd",   "email": "contact@greenleaf.co",  "phone": "+1-312-555-0193", "company": "GreenLeaf Ltd",   "status": "prospect"},
    {"name": "Skybridge SaaS",  "email": "info@skybridge.com",    "phone": "+1-206-555-0174", "company": "Skybridge SaaS",  "status": "prospect"},
    {"name": "Momentum AI",     "email": "hello@momentumai.com",  "phone": "+1-510-555-0165", "company": "Momentum AI",     "status": "lead"},
    {"name": "PulseData Co",    "email": "team@pulsedata.io",     "phone": "+1-737-555-0156", "company": "PulseData Co",    "status": "lead"},
    {"name": "Cloudify Systems","email": "ops@cloudify.net",      "phone": "+1-669-555-0147", "company": "Cloudify Systems","status": "active"},
    {"name": "BlueSpark Media", "email": "media@bluespark.com",   "phone": "+1-929-555-0138", "company": "BlueSpark Media", "status": "inactive"},
    {"name": "Vertex Labs",     "email": "labs@vertexlabs.io",    "phone": "+1-503-555-0129", "company": "Vertex Labs",     "status": "churned"},
    {"name": "FinTrack Pro",    "email": "contact@fintrack.pro",  "phone": "+1-857-555-0110", "company": "FinTrack Pro",    "status": "active"},
    {"name": "LoopNet Analytics","email":"hi@loopnet.ai",         "phone": "+1-415-555-0121", "company": "LoopNet Analytics","status": "prospect"},
    {"name": "Orbis Digital",   "email": "hello@orbisdigital.com","phone": "+1-213-555-0132", "company": "Orbis Digital",   "status": "active"},
]

print("Creating customers...")
customer_ids = {}
for c in CUSTOMERS:
    r = post("/customers/", c)
    if r.status_code == 201:
        cid = r.json()["id"]
        customer_ids[c["name"]] = cid
        print(f"  ✓ {c['name']}")
    else:
        # already exists — fetch
        r2 = requests.get(f"{BASE}/customers/?limit=200", headers=H)
        for item in r2.json().get("items", []):
            if item["email"] == c["email"]:
                customer_ids[c["name"]] = item["id"]
        print(f"  ~ {c['name']} (exists)")

# ── Contacts ──────────────────────────────────────────────────────────────────
CONTACTS = {
    "Acme Corp": [
        {"name": "Jordan Ellis",   "email": "j.ellis@acme.com",    "phone": "+1-415-555-0201", "title": "VP of Engineering",   "is_primary": True},
        {"name": "Priya Sharma",   "email": "p.sharma@acme.com",   "phone": "+1-415-555-0202", "title": "Procurement Manager", "is_primary": False},
    ],
    "TechNova Inc": [
        {"name": "Marcus Webb",    "email": "m.webb@technova.io",  "phone": "+1-628-555-0203", "title": "CTO",                "is_primary": True},
        {"name": "Aisha Patel",    "email": "a.patel@technova.io", "phone": "+1-628-555-0204", "title": "Head of Product",    "is_primary": False},
    ],
    "GreenLeaf Ltd": [
        {"name": "Sam Torres",     "email": "s.torres@greenleaf.co","phone":"+1-312-555-0205", "title": "CEO",                "is_primary": True},
    ],
    "FinTrack Pro": [
        {"name": "Lena Kowalski",  "email": "l.kowalski@fintrack.pro","phone":"+1-857-555-0206","title":"COO",               "is_primary": True},
        {"name": "Derek Osei",     "email": "d.osei@fintrack.pro", "phone": "+1-857-555-0207", "title": "Sales Director",     "is_primary": False},
    ],
}

print("\nCreating contacts...")
for company, contacts in CONTACTS.items():
    cid = customer_ids.get(company)
    if not cid: continue
    for contact in contacts:
        r = requests.post(f"{BASE}/customers/{cid}/contacts/", json=contact, headers=H)
        print(f"  ✓ {contact['name']} @ {company}" if r.status_code == 201 else f"  ~ {contact['name']} ({r.status_code})")

# ── Deals ─────────────────────────────────────────────────────────────────────
today = date.today()
DEALS = [
    {"company": "Acme Corp",        "title": "Enterprise Platform License",  "value": 120000, "stage": "negotiation",   "probability": 80, "close_days": 14},
    {"company": "Acme Corp",        "title": "Premium Support Package",       "value": 24000,  "stage": "proposal",      "probability": 60, "close_days": 30},
    {"company": "TechNova Inc",     "title": "Annual SaaS Subscription",      "value": 85000,  "stage": "closed_won",    "probability": 100,"close_days": -5},
    {"company": "TechNova Inc",     "title": "Professional Services",         "value": 35000,  "stage": "qualification", "probability": 45, "close_days": 45},
    {"company": "GreenLeaf Ltd",    "title": "Starter Plan — 50 Seats",       "value": 18000,  "stage": "proposal",      "probability": 55, "close_days": 21},
    {"company": "Skybridge SaaS",   "title": "API Integration Bundle",        "value": 42000,  "stage": "prospecting",   "probability": 20, "close_days": 60},
    {"company": "Momentum AI",      "title": "Pilot Program — 3 Months",      "value": 9500,   "stage": "qualification", "probability": 35, "close_days": 30},
    {"company": "PulseData Co",     "title": "Data Analytics Suite",          "value": 67000,  "stage": "negotiation",   "probability": 75, "close_days": 10},
    {"company": "Cloudify Systems", "title": "Multi-Cloud Deployment",        "value": 98000,  "stage": "closed_won",    "probability": 100,"close_days": -10},
    {"company": "Cloudify Systems", "title": "Managed Services Retainer",     "value": 36000,  "stage": "proposal",      "probability": 65, "close_days": 25},
    {"company": "BlueSpark Media",  "title": "Campaign Automation Tool",      "value": 22000,  "stage": "closed_lost",   "probability": 0,  "close_days": -20},
    {"company": "FinTrack Pro",     "title": "Finance Module Expansion",      "value": 54000,  "stage": "negotiation",   "probability": 85, "close_days": 7},
    {"company": "FinTrack Pro",     "title": "Compliance Reporting Add-on",   "value": 15000,  "stage": "qualification", "probability": 50, "close_days": 40},
    {"company": "LoopNet Analytics","title": "Real-Time Dashboard License",   "value": 31000,  "stage": "proposal",      "probability": 60, "close_days": 18},
    {"company": "Orbis Digital",    "title": "Growth Accelerator Bundle",     "value": 47000,  "stage": "prospecting",   "probability": 25, "close_days": 75},
    {"company": "Orbis Digital",    "title": "SEO & Analytics Suite",         "value": 19500,  "stage": "closed_won",    "probability": 100,"close_days": -3},
    {"company": "Vertex Labs",      "title": "Research Platform Access",      "value": 28000,  "stage": "closed_lost",   "probability": 0,  "close_days": -30},
]

print("\nCreating deals...")
deal_ids = []
for d in DEALS:
    cid = customer_ids.get(d["company"])
    if not cid: continue
    close_date = (today + timedelta(days=d["close_days"])).isoformat()
    payload = {
        "customer_id": cid,
        "title": d["title"],
        "value": d["value"],
        "stage": d["stage"],
        "probability": d["probability"],
        "expected_close_date": close_date,
    }
    r = post("/deals/", payload)
    if r.status_code == 201:
        deal_ids.append((r.json()["id"], d["company"], d["title"]))
        print(f"  ✓ {d['title']} ({d['stage']})")
    else:
        print(f"  ! {d['title']} — {r.status_code}: {r.text[:60]}")

# ── Activities ────────────────────────────────────────────────────────────────
ACTIVITIES = [
    ("Acme Corp",        "call",    "Discovery call — discussed enterprise needs and integration requirements", -5, True),
    ("Acme Corp",        "email",   "Sent pricing proposal for Enterprise License", -3, True),
    ("Acme Corp",        "meeting", "QBR with VP Engineering — demo of new reporting module", -1, True),
    ("Acme Corp",        "call",    "Follow-up on contract review — legal team reviewing", 2, False),
    ("TechNova Inc",     "meeting", "Kick-off call for SaaS subscription onboarding", -7, True),
    ("TechNova Inc",     "email",   "Sent onboarding checklist and Slack invite", -4, True),
    ("TechNova Inc",     "call",    "Qualification call for Professional Services scope", 3, False),
    ("GreenLeaf Ltd",    "email",   "Initial outreach — introduced product features", -10, True),
    ("GreenLeaf Ltd",    "call",    "Intro call with CEO Sam Torres", -6, True),
    ("GreenLeaf Ltd",    "meeting", "Product demo — showcased team collaboration features", 1, False),
    ("PulseData Co",     "call",    "Contract negotiation — working through security addendum", -2, True),
    ("PulseData Co",     "email",   "Sent revised MSA with updated SLA terms", -1, True),
    ("PulseData Co",     "call",    "Final review call before signature", 1, False),
    ("Cloudify Systems", "meeting", "Post-sale kick-off — introduced account team", -12, True),
    ("Cloudify Systems", "email",   "Managed Services proposal sent for review", -4, True),
    ("FinTrack Pro",     "call",    "Deep-dive on compliance module requirements", -3, True),
    ("FinTrack Pro",     "email",   "Shared compliance checklist and integration guide", -1, True),
    ("FinTrack Pro",     "meeting", "Exec alignment call — Finance Module expansion scope", 0, False),
    ("LoopNet Analytics","email",   "Proposal sent for Real-Time Dashboard License", -2, True),
    ("LoopNet Analytics","call",    "Technical call — discussed API rate limits and data volume", 2, False),
    ("Momentum AI",      "call",    "First qualification call — strong interest in pilot", -8, True),
    ("Skybridge SaaS",   "email",   "Cold outreach — introduced API integration use cases", -14, True),
    ("Orbis Digital",    "meeting", "Closed — Growth Accelerator contract signed", -3, True),
    ("Orbis Digital",    "call",    "Upsell discovery — SEO suite expansion discussion", 5, False),
]

print("\nCreating activities...")
for company, atype, desc, days_offset, completed in ACTIVITIES:
    cid = customer_ids.get(company)
    if not cid: continue
    scheduled = (today + timedelta(days=days_offset)).isoformat() + "T10:00:00"
    r = post("/activities/", {
        "customer_id": cid,
        "activity_type": atype,
        "description": desc,
        "scheduled_at": scheduled,
        "completed": completed,
    })
    print(f"  ✓ [{atype}] {company}" if r.status_code == 201 else f"  ! {company} — {r.status_code}")

# ── Notes ─────────────────────────────────────────────────────────────────────
NOTES = [
    ("Acme Corp", "Champion is Jordan Ellis (VP Eng). Decision committee includes CFO and legal. Budget approved — Q2 close target. Key concern: SSO integration with Okta."),
    ("Acme Corp", "Competitor: they also evaluated Salesforce but found it too complex for their 40-person team. Price sensitivity is low — focus on ROI story."),
    ("TechNova Inc", "Marcus Webb is highly technical. Lead with API docs and integration guides. He wants a Slack-based support channel as part of the contract."),
    ("GreenLeaf Ltd", "CEO Sam Torres makes all decisions. Very ROI-focused — prepare a 3-month payback calculation before next meeting. Budget: ~$20k."),
    ("PulseData Co", "Strong deal — security review is the only remaining blocker. Their infosec team needs SOC 2 Type II report. Follow up with compliance team."),
    ("Cloudify Systems", "Existing customer — expansion opportunity is the Managed Services retainer. Happy with multi-cloud deployment. NPS score: 9/10."),
    ("FinTrack Pro", "Lena (COO) owns the budget. Derek handles technical evaluation. Both attended the exec alignment call. Target: sign before end of month."),
    ("LoopNet Analytics", "Early stage but high potential. They process 2M+ events/day — pitch the Real-Time Dashboard as a competitive advantage over their current Tableau setup."),
]

print("\nCreating notes...")
for company, content in NOTES:
    cid = customer_ids.get(company)
    if not cid: continue
    r = post("/notes/", {"customer_id": cid, "content": content})
    print(f"  ✓ Note for {company}" if r.status_code == 201 else f"  ! {company} — {r.status_code}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
✅ Seed complete!
   Customers : {len(customer_ids)}
   Deals     : {len(deal_ids)}
   Activities: {len(ACTIVITIES)}
   Notes     : {len(NOTES)}

Open the app: http://localhost:3006/dashboard
""")
