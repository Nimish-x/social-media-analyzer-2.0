# Make.com Automation for Social Leaf

## Available Scenarios

### 1. Analytics Sync (Scheduled)
**File:** `social-leaf-analytics-sync.json`

**What it does:**
- Runs every 6 hours
- Fetches all platform analytics from Social Leaf API
- Saves data to Google Sheets (separate tabs per platform)
- Posts summary to Slack

**Flow:**
```
Schedule (6h) → GET /api/real/all → Router
                                      ├→ YouTube → Google Sheets
                                      ├→ Instagram → Google Sheets
                                      ├→ Twitter → Google Sheets
                                      └→ LinkedIn → Google Sheets
                                              ↓
                                         Slack Summary
```

---

### 2. Engagement Alert (Webhook)
**File:** `social-leaf-engagement-alert.json`

**What it does:**
- Listens for webhook from Social Leaf
- Filters for engagement > 10%
- Sends alerts to Slack, Discord, and Email

**Flow:**
```
Webhook → Filter (>10%) → Slack Alert
                        → Discord Alert
                        → Email Alert
```

---

## Setup Instructions

### Step 1: Import to Make.com
1. Go to [make.com](https://make.com)
2. Create new scenario
3. Click "..." → Import Blueprint
4. Upload the JSON file

### Step 2: Configure Connections

**Google Sheets:**
1. Create a spreadsheet with tabs: "YouTube Analytics", "Instagram Analytics", "Twitter Analytics", "LinkedIn Analytics"
2. Replace `YOUR_SPREADSHEET_ID` with your spreadsheet ID
3. Each tab should have columns: Date, Metric1, Metric2, Metric3, Metric4

**Slack:**
1. Connect your Slack workspace
2. Replace `YOUR_CHANNEL_ID` with target channel ID

**Discord (Optional):**
1. Create a webhook in your Discord server
2. Replace `YOUR_DISCORD_WEBHOOK` with the URL

### Step 3: Update API URL
Replace `http://localhost:8000` with your deployed backend URL when you go live.

---

## Webhook Setup (for Engagement Alerts)

Add this to your Social Leaf backend to trigger the webhook:

```python
# In your backend, after detecting high engagement:
import httpx

async def notify_high_engagement(platform: str, content: str, engagement: float):
    webhook_url = "https://hook.make.com/YOUR_WEBHOOK_ID"
    await httpx.post(webhook_url, json={
        "platform": platform,
        "content_title": content,
        "engagement_rate": engagement,
    })
```

---

## Schedule Options

| Interval | Use Case |
|----------|----------|
| 1 hour | Real-time monitoring |
| 6 hours | Standard tracking |
| 24 hours | Daily summary |

To change: Edit the trigger node → Set interval in minutes.
