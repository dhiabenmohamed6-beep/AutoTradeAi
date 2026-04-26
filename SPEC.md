# AutoTradeAi - Specification Document

## 1. Project Overview

**Project Name:** AutoTradeAi
**Type:** SaaS Web Application
**Core Functionality:** AI-powered trading assistant that analyzes chart screenshots using computer vision and returns dynamic trading decisions
**Target Users:** Traders (stocks, crypto, forex) seeking AI-assisted chart analysis

---

## 2. UI/UX Specification

### Layout Structure

**Pages:**
1. Landing Page (/)
2. Live Market Page (/markets)
3. AI Analysis Page (/analyze)
4. Dashboard (/dashboard)
5. Admin Dashboard (/admin)
6. Contact (/contact)
7. Login (/login)
8. Register (/register)
9. Subscription (/subscription)

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette:**
- Primary Background: #0a0a0a (near black)
- Secondary Background: #111111
- Card Background: #1a1a1a
- Primary Accent: #00ff88 (bright green)
- Secondary Accent: #00cc6a
- Text Primary: #ffffff
- Text Secondary: #a0a0a0
- Border: #2a2a2a
- Error: #ff4444
- Warning: #ffaa00
- Success: #00ff88

**Typography:**
- Headings: "Outfit", sans-serif (weight 600-700)
- Body: "DM Sans", sans-serif (weight 400-500)
- Monospace (prices): "JetBrains Mono", monospace

**Spacing System:**
- Base unit: 4px
- Section padding: 80px vertical, 24px horizontal
- Card padding: 24px
- Gap: 16px-24px

**Visual Effects:**
- Card shadows: 0 4px 24px rgba(0, 255, 136, 0.05)
- Hover glow: 0 0 20px rgba(0, 255, 136, 0.15)
- Border radius: 12px (cards), 8px (buttons), 50% (avatars)
- Transitions: 0.3s ease

### Components

**Navigation:**
- Logo (left)
- Nav links (center): Markets, Analyze, Dashboard
- Auth buttons (right): Login, Get Started
- Mobile: Hamburger menu

**Buttons:**
- Primary: Green bg (#00ff88), black text, hover glow
- Secondary: Transparent, green border, green text
- Disabled: Gray bg, reduced opacity

**Cards:**
- Dark background (#1a1a1a)
- Subtle green border on hover
- Smooth scale transform

**Form Inputs:**
- Dark bg (#111111)
- Green focus border
- Placeholder text in gray

**Loading States:**
- Pulsing green dots animation
- Progress bar for AI analysis
- Skeleton loaders

---

## 3. Functionality Specification

### Core Features

#### Authentication System
- Email/password registration and login
- Google OAuth (optional)
- JWT tokens with 7-day expiry
- Password hashing with bcrypt
- Protected routes middleware

#### Image Upload & Analysis
- Drag & drop + file picker
- Supported formats: PNG, JPG, JPEG
- Max file size: 5MB
- Preview before analysis
- AI processing with loading state

#### AI Analysis Engine (Dynamic)
**Input:** Chart image
**Process:**
1. Send image to OpenAI Vision API with detailed prompt
2. Prompt instructs AI to analyze ONLY the provided image
3. Extract visible data: trends, patterns, indicators, price levels
4. Generate unique response each time

**Output Structure:**
```json
{
  "signal": "Buy|Sell|Hold",
  "confidence": 75,
  "entryPrice": 1.2345,
  "stopLoss": 1.2300,
  "takeProfit": [1.2400, 1.2450],
  "riskLevel": "Low|Medium|High",
  "explanation": "..."
}
```

#### Subscription System
- 7-day free trial for all users
- Trial status tracked in user model
- After trial: AI analysis blocked, subscription popup shown
- Subscription plans:
  - Premium: 59 DT/month
- Payment methods: E-Dinar, Bank transfer
- Admin manual validation

#### Live Market Section
- TradingView-style embedded charts
- Multiple markets: Crypto, Stocks, Forex
- Symbol search
- Real-time price display (mock data for demo)

#### Admin Dashboard
- User management (view, delete)
- Subscription management
- AI usage statistics
- Uploaded charts gallery
- Contact messages
- Payment approvals

#### Contact System
- Contact form (name, email, message)
- Stored in MongoDB
- Admin can view and manage

#### i18n System
- Languages: English, French, Arabic
- Language switcher in header
- Persistent language preference

### User Interactions

1. **Upload Flow:**
   - Drag/drop or click to select image
   - Preview image
   - Click "Analyze"
   - Loading animation (5-15 seconds)
   - Results displayed with animated reveal

2. **Subscription Flow:**
   - Trial active: Full AI access
   - Trial expired: Block analysis, show popup
   - Choose payment method
   - Admin validates payment
   - Subscription activated

### Edge Cases
- Invalid file type: Show error message
- File too large: Show error message
- AI fails to analyze: Return "Unable to analyze" with HOLD signal
- Network error: Retry option
- Unauthorized access: Redirect to login

---

## 4. Technical Architecture

### Backend (Node.js + Express)
```
/server
  /config
    - db.js (MongoDB connection)
  /controllers
    - authController.js
    - analysisController.js
    - subscriptionController.js
    - adminController.js
    - contactController.js
  /middleware
    - auth.js
    - admin.js
    - upload.js
  /models
    - User.js
    - Analysis.js
    - Contact.js
    - Subscription.js
  /routes
    - auth.js
    - analysis.js
    - subscription.js
    - admin.js
    - contact.js
  /services
    - aiService.js (OpenAI integration)
  server.js
```

### Frontend (React + Tailwind)
```
/client
  /src
    /components
      - Navbar.jsx
      - Footer.jsx
      - LanguageSwitcher.jsx
      - ProtectedRoute.jsx
      - LoadingSpinner.jsx
    /pages
      - Landing.jsx
      - Markets.jsx
      - Analyze.jsx
      - Dashboard.jsx
      - Admin.jsx
      - Contact.jsx
      - Login.jsx
      - Register.jsx
      - Subscription.jsx
    /context
      - AuthContext.jsx
      - LanguageContext.jsx
    /hooks
      - useAuth.js
    /i18n
      - en.json
      - fr.json
      - ar.json
    /services
      - api.js
    App.jsx
    main.jsx
    index.css
```

### Database (MongoDB)
- **Users:** email, password, name, role, trialActive, trialExpiresAt, subscription, createdAt
- **Analyses:** userId, imageUrl, result, createdAt
- **Contacts:** name, email, message, createdAt
- **Subscriptions:** userId, plan, status, paymentMethod, createdAt

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme applied consistently
- [ ] Green accent color visible on interactive elements
- [ ] Smooth animations on page transitions
- [ ] Responsive layout on all breakpoints
- [ ] Loading states display correctly

### Functional Checkpoints
- [ ] User can register and login
- [ ] User can upload chart image
- [ ] AI returns dynamic analysis (not static)
- [ ] Trial system works correctly
- [ ] Subscription popup appears after trial
- [ ] Admin can access admin dashboard
- [ ] Language switcher works
- [ ] Contact form submits successfully

### Security Checkpoints
- [ ] JWT auth protects routes
- [ ] File upload validates type and size
- [ ] Passwords are hashed
- [ ] Admin routes protected

---

## 6. AI Analysis Prompt

The AI analysis uses this core prompt structure (sent to OpenAI Vision):

```
You are a professional trading analyst with 20 years of experience. 
Analyze the provided chart image and return a JSON object with your trading decision.

Instructions:
1. Analyze ONLY what is visible in the image
2. Identify the trend direction (uptrend/downtrend/consolidation)
3. Find support and resistance zones
4. Look for patterns (breakouts, fakeouts, reversals)
5. Note any visible indicators (RSI, MACD, Moving Averages)
6. Evaluate market structure, momentum, and volatility
7. Extract actual price levels visible on the chart

Return ONLY a JSON object (no other text):
{
  "signal": "Buy" or "Sell" or "Hold",
  "confidence": 0-100 (based on clarity and quality of setup),
  "entryPrice": actual price from chart or null,
  "stopLoss": actual price from chart or null,
  "takeProfit": [price1, price2] or [],
  "riskLevel": "Low" or "Medium" or "High",
  "explanation": "2-3 sentences explaining your analysis"
}

If the chart is unclear or insufficient:
- Set signal to "Hold"
- Set confidence to 30 or lower
- Explain why in the explanation

IMPORTANT: Generate unique analysis for each image. Never reuse previous responses.
```
