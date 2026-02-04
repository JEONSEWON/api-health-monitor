# API Health Monitor - Frontend

Next.js 14 frontend for API Health Monitor.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment

```bash
# .env.local is already created
# Update API URL if needed (default: http://localhost:8000)
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Landing page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── dashboard/        # Main dashboard (TODO)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components (TODO)
├── lib/
│   ├── api.ts           # API client
│   └── store.ts         # Zustand store
├── hooks/               # Custom hooks (TODO)
└── public/              # Static files
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 📝 Features Implemented

- [x] Landing page with pricing
- [x] Login/Register pages
- [x] API client with auth
- [x] Token refresh handling
- [x] State management

## 📝 TODO

- [ ] Dashboard layout with sidebar
- [ ] Monitor list page
- [ ] Create/edit monitor modal
- [ ] Monitor details page with charts
- [ ] Alert channel management
- [ ] Analytics page
- [ ] Settings page
- [ ] Public status page
- [ ] Billing page

## 🎯 API Integration

All API calls go through `lib/api.ts`:

```typescript
import { authAPI, monitorsAPI } from '@/lib/api';

// Login
const response = await authAPI.login(email, password);

// List monitors
const monitors = await monitorsAPI.list();
```

Authentication is handled automatically:
- Access token stored in localStorage
- Auto-attached to requests
- Auto-refresh on 401

## 🎨 Styling

Tailwind CSS with custom green theme:

```typescript
// Primary green color palette
primary: {
  50: '#f0fdf4',
  100: '#dcfce7',
  ...
  600: '#16a34a',  // Main brand color
  ...
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repo
# Vercel will auto-detect Next.js
# Set environment variable:
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```

### Build Locally

```bash
npm run build
npm start
```

---

Built with ❤️ using Next.js 14
