# Account Setup Guide

This guide details how to set up a new social media account in the codebase for the Multi-Account Platform.  
**For AI Agents:** You must follow these steps precisely. Do NOT build web forms or UI to ingest this data. All data must be seeded into the codebase as JSON. If the user asks you to add an account but does not provide enough data (like an avatar URL, description, or the analytics data), **you must explicitly ask the user for the missing data before proceeding.**

## Prerequisites

Before you start, ensure you have the following from the user:

- `account_id` (A snake_case identifier, e.g., `tech_startup`)
- `account_name` (A human-readable name, e.g., `Tech Startup Inc.`)
- `avatar_url` (A valid URL for the account profile picture)
- `description` (A short sentence describing the account)
- Analytics Data (Optional but recommended to populate `analytics_raw.json`)

## Step 1: Create the Account Directory

Create a new directory for the account inside the `accounts` data folder:

```
src/lib/data/accounts/[account_id]/
```

## Step 2: Seed the JSON Data

Create the following JSON files inside the new directory. If the user hasn't provided the actual data yet, initialize them with empty states as shown below.

**1. `analytics_raw.json**`

```json
{}
```

**2. `bullseye_analysis.json**`

```json
{}
```

**3. `post_analysis.json**`

```json
{}
```

**4. `posts.json**`

```json
[]
```

*Note: The platform is built to handle empty states gracefully. If data is missing, the dashboard will render placeholders.*

## Step 3: Register the Account

Open `src/lib/data/accounts_registry.json`. This file contains an array of all configured accounts. Add the new account object to the array:

```json
[
  // ... existing accounts ...
  {
    "id": "[account_id]",
    "name": "[account_name]",
    "avatar_url": "[avatar_url]",
    "description": "[description]"
  }
]
```

## Step 4: Content Generation Pipeline (Optional)

Not every account will need the content generation pipeline (the ability to generate and preview Svelte-based Instagram posts).  
If the user requests it:

1. Create a `content/` directory at `src/routes/a/[account_id]/content/`.
2. Follow the standard content generation workflow as defined in `WORKFLOW.md`.

## Step 5: Configure the Instagram MCP Server (Data Fetching)

If the new account requires fetching real data from Instagram, its credentials must be added to the MCP configuration.

**How to Generate a Meta Graph API Access Token:**

1. Go to [Meta for Developers](https://developers.facebook.com/apps/) and log in.
2. Select **Tools **> **Graph API Explorer** from the dropdown list.
3. On the Graph API Explorer page, look at the right sidebar panel:
  - Under **Meta App**, select your application (e.g., "My Content Tool").
  - Under **User or Page**, click the dropdown and select **Get Page Access Token** or **Get User Access Token**.  
  *(Note: You must authorize the app to access the specific Facebook Page linked to your Instagram Business account).*
  - Once authorized, make sure the dropdown now shows the name of your Facebook Page.
4. Under the **Permissions** section in that same right sidebar, click **Add a Permission** and ensure the following are added:
  - `instagram_basic`
  - `instagram_manage_insights`
  - `pages_show_list`
  - `pages_read_engagement`
5. Click the **Generate Access Token** button.
6. A long string of characters will appear in the "Access Token" field at the top. Copy this token.

*(Optional but recommended: Click the 'i' icon inside the Access Token field and click "Open in Access Token Tool" to extend it to a long-lived 60-day token).*

**Update the Configuration:**

1. Open `.agents/mcp_config.json`.
2. Replace the value of `INSTAGRAM_ACCESS_TOKEN` with your newly copied token.
3. Replace `INSTAGRAM_BUSINESS_ACCOUNT_ID` with the correct Instagram account ID.

## Step 6: Verification

Run the development server (`npm run dev` or `pnpm run dev`). Navigate to the root directory `/`. You should see the newly added account listed in the Accounts Hub. Clicking it should route you to `/a/[account_id]` and display its dashboard.
