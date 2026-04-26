# Deployment Options

## Option 1: Vercel Postgres (No Credit Card Required)

### Backend Setup
1. Go to https://vercel.com → Dashboard → Storage → Create Database
   - Select **Postgres**
   - Plan: **Free** (5GB storage, 1B rows/month)
   - Region: choose closest to you
   - Name: `autotradeai-db`
   - Click **Create**

2. Get connection string:
   - Click on your DB → **Connection Details**
   - Copy the **Connection String** (starts with `postgres://`)
   - This is your `POSTGRES_URL`

### Code Changes Required

You need to replace MongoDB with PostgreSQL. This requires:

1. Install PostgreSQL dependencies:
```bash
cd server
npm install pg dotenv
```

2. Replace `server/models/*.js` files with PostgreSQL schema
3. Update all controllers to use SQL instead of MongoDB queries
4. Update `server/server.js` to remove mongoose, add pg client

**Estimated time**: 2-3 hours of code changes

---

## **Option 2: MongoDB Atlas (Requires Credit Card)**

- Free tier: 512MB storage, shared RAM
- Requires credit card for verification
- No time limit, completely free until you exceed limits
- Most reliable for MongoDB apps

If you have a credit card (even a prepire one), this is easier - just sign up and add card.

---

## **Option 3: Free MongoDB Alternatives (No Credit Card)**

1. **MongoDB Stitch** (deprecated)
2. **Clever Cloud** (free 256MB, EU only)
3. **YugabyteDB** (self-hosted on Railway) - complex

---

## **My Recommendation**

If you have **any credit/debit card** (even with $0 balance):
→ Use **MongoDB Atlas** (Option 2). Just add card, you won't be charged.

If you **don't have a card**:
→ Use **Vercel Postgres** (Option 1). I can help migrate the code to PostgreSQL.

Which option works for you?
