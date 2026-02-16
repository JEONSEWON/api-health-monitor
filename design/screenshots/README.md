# CheckAPI Screenshots

Product screenshots for marketing, Product Hunt, and documentation.

## Files

### 01-dashboard-empty.png
- **Page**: Dashboard (Empty State)
- **User**: test (Starter Plan)
- **Features shown**:
  - Clean sidebar navigation (Monitors, Alert Channels, Analytics, Settings)
  - Empty state with "Create Monitor" CTA
  - Stats cards: Total Monitors (0), Online (0), Offline (0), Overall Uptime (100%)
  - Upgrade to Pro button
- **Use for**: Onboarding flow, First-time user experience

### 02-landing-page.png
- **Page**: Landing Page (checkapi.io)
- **Features shown**:
  - Hero section: "Monitor Your APIs 24/7 Uptime Tracking"
  - Value proposition: "Get instant alerts when your APIs go down"
  - CTAs: "Start Free Trial" + "View Pricing"
  - Free plan benefits (No credit card required, Cancel anytime)
  - Status page demo with 3 monitors (Production API, Staging Environment, CDN Endpoint)
  - All systems operational (99.8% uptime)
- **Use for**: Product Hunt main image, Social media, README hero

### 03-monitor-detail.png
- **Page**: Monitor Detail (Production API)
- **URL**: https://httpbin.org/status/200
- **Features shown**:
  - Status badge: "Up • checked about 9 hours ago"
  - Key metrics: Uptime 100%, Avg Response Time 674ms, Total Checks 5, Incidents 0
  - Configuration details (Method: GET, Interval: 300s, Timeout: 30s, Expected Status: 200)
  - Recent checks history with timestamps and response times
  - Pause/Delete buttons
- **Use for**: Feature demonstration, Dashboard walkthrough

### 04-analytics.png
- **Page**: Analytics Dashboard
- **Features shown**:
  - Performance overview: Total Monitors (3 active), Overall Uptime (100%), Total Checks (18), Status (3/3 online)
  - Monitor Status Distribution (visual breakdown: 3 Online, 0 Degraded, 0 Offline)
  - Recent Incidents (7 days): "No incidents - All systems have been running smoothly!"
  - Time period: Last 24 hours
- **Use for**: Analytics feature showcase, Performance visualization

## Image Specifications

- **Format**: PNG
- **Quality**: High-resolution screenshots
- **Aspect Ratio**: Desktop (wide)
- **Browser**: Chrome/Edge
- **Theme**: Light mode

## Usage

### Product Hunt
- **Main Image**: 02-landing-page.png
- **Gallery Images**: 01-dashboard-empty.png, 03-monitor-detail.png, 04-analytics.png
- **Thumbnail**: Crop from 02-landing-page.png (1:1 ratio)

### README.md
```markdown
## Screenshots

![Landing Page](design/screenshots/02-landing-page.png)
![Dashboard](design/screenshots/01-dashboard-empty.png)
![Monitor Detail](design/screenshots/03-monitor-detail.png)
![Analytics](design/screenshots/04-analytics.png)
```

### Twitter Thread
- Use 02-landing-page.png for main tweet
- Use 03-monitor-detail.png for feature highlight
- Use 04-analytics.png for metrics/analytics

### Documentation
- Landing page for "Getting Started"
- Dashboard for "User Guide"
- Monitor detail for "Creating Monitors"
- Analytics for "Understanding Your Data"

## Notes

- All screenshots show clean, professional UI
- Green color scheme emphasizes reliability and uptime
- Empty states are user-friendly with clear CTAs
- Data shown is realistic but safe (test environment)
