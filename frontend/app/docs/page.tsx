import Link from 'next/link';

export const metadata = {
  title: 'Documentation – CheckAPI',
  description: 'Learn how to set up API monitoring, configure alert channels, and use CheckAPI to keep your endpoints healthy.',
};

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'create-monitor', label: 'Create Your First Monitor' },
    ],
  },
  {
    id: 'monitors',
    title: 'Monitors',
    items: [
      { id: 'monitor-config', label: 'Monitor Configuration' },
      { id: 'http-methods', label: 'HTTP Methods' },
      { id: 'keyword-validation', label: 'Keyword Validation' },
      { id: 'check-intervals', label: 'Check Intervals' },
    ],
  },
  {
    id: 'alerts',
    title: 'Alert Channels',
    items: [
      { id: 'email', label: 'Email' },
      { id: 'slack', label: 'Slack' },
      { id: 'telegram', label: 'Telegram' },
      { id: 'discord', label: 'Discord' },
      { id: 'webhook', label: 'Custom Webhook' },
    ],
  },
  {
    id: 'plans',
    title: 'Plans & Limits',
    items: [
      { id: 'free-plan', label: 'Free Plan' },
      { id: 'paid-plans', label: 'Paid Plans' },
      { id: 'data-retention', label: 'Data Retention' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                CheckAPI
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="/#features" className="text-gray-700 hover:text-green-600 transition">Features</a>
              <a href="/#pricing" className="text-gray-700 hover:text-green-600 transition">Pricing</a>
              <Link href="/docs" className="text-green-600 font-medium transition">Docs</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-green-600 transition">Log in</Link>
              <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Documentation
          </span>
        </h1>
        <p className="text-gray-500 text-lg">Everything you need to monitor your APIs with CheckAPI.</p>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 flex gap-10">

        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{section.title}</p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-gray-600 hover:text-green-600 transition block py-0.5"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl space-y-16 text-gray-600 leading-relaxed">

          {/* Getting Started */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b border-gray-200">Getting Started</h2>

            <div id="quick-start" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Start</h3>
              <p className="mb-4">
                CheckAPI monitors your API endpoints 24/7 and alerts you the moment something goes wrong. You can be up and running in under 2 minutes.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Create a free account at <Link href="/register" className="text-green-600 hover:text-green-700">checkapi.io/register</Link></li>
                <li>Click <strong className="text-gray-800">Add Monitor</strong> from your dashboard</li>
                <li>Enter your API endpoint URL and configure the check settings</li>
                <li>Add at least one alert channel (Email, Slack, Discord, etc.)</li>
                <li>Save — monitoring starts immediately</li>
              </ol>
            </div>

            <div id="create-monitor">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Create Your First Monitor</h3>
              <p className="mb-4">
                From your dashboard, click the <strong className="text-gray-800">+ Add Monitor</strong> button. Fill in:
              </p>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-3 text-sm">
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-36 shrink-0">Name</span><span>A friendly label for this monitor (e.g. "Production API")</span></div>
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-36 shrink-0">URL</span><span>The full endpoint URL including protocol (e.g. https://api.example.com/health)</span></div>
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-36 shrink-0">Method</span><span>HTTP method: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS</span></div>
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-36 shrink-0">Interval</span><span>How often to check (depends on your plan)</span></div>
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-36 shrink-0">Expected Status</span><span>Expected HTTP response code (default: 200)</span></div>
              </div>
            </div>
          </section>

          {/* Monitors */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b border-gray-200">Monitors</h2>

            <div id="monitor-config" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Monitor Configuration</h3>
              <p>
                Each monitor continuously sends HTTP requests to your endpoint and records the result — status code, response time, and response body. If a check fails, CheckAPI immediately triggers your configured alert channels.
              </p>
            </div>

            <div id="http-methods" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">HTTP Methods</h3>
              <p className="mb-4">CheckAPI supports all standard HTTP methods so you can test real API behavior, not just GET endpoints:</p>
              <div className="flex flex-wrap gap-2">
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
                  <span key={m} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-mono font-medium border border-green-200">{m}</span>
                ))}
              </div>
              <p className="mt-4">For POST, PUT, and PATCH requests, you can also include a request body (JSON).</p>
            </div>

            <div id="keyword-validation" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Keyword Validation</h3>
              <p className="mb-4">
                A 200 OK response doesn't always mean your API is healthy. CheckAPI supports response body keyword validation — you can specify a keyword that must be <strong className="text-gray-800">present</strong> or <strong className="text-gray-800">absent</strong> in the response body.
              </p>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-3 text-sm">
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-28 shrink-0">Present</span><span>Check fails if the keyword is NOT found in the response body</span></div>
                <div className="flex gap-3"><span className="font-semibold text-gray-800 w-28 shrink-0">Absent</span><span>Check fails if the keyword IS found in the response body</span></div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Example: validate that <code className="bg-gray-100 px-1 rounded">"status":"ok"</code> is present, or that <code className="bg-gray-100 px-1 rounded">"error"</code> is absent.</p>
            </div>

            <div id="check-intervals">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Check Intervals</h3>
              <p className="mb-4">How frequently CheckAPI checks your endpoint depends on your plan:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Interval</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Monitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-3">Free</td><td className="px-4 py-3">5 minutes</td><td className="px-4 py-3">10</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-3">Starter</td><td className="px-4 py-3">1 minute</td><td className="px-4 py-3">20</td></tr>
                    <tr><td className="px-4 py-3">Pro</td><td className="px-4 py-3">30 seconds</td><td className="px-4 py-3">100</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-3">Business</td><td className="px-4 py-3">10 seconds</td><td className="px-4 py-3">Unlimited</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Alert Channels */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b border-gray-200">Alert Channels</h2>
            <p className="mb-8">CheckAPI supports 5 alert channels. You can add multiple channels per account and test each one before going live.</p>

            <div id="email" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Email</h3>
              <p>Enter your email address. CheckAPI will send an alert whenever a monitor goes down or recovers.</p>
            </div>

            <div id="slack" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Slack</h3>
              <p className="mb-3">Create an Incoming Webhook in your Slack workspace and paste the URL.</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Go to your Slack workspace → <strong>Apps</strong> → search "Incoming Webhooks"</li>
                <li>Add it to a channel and copy the Webhook URL</li>
                <li>Paste the URL starting with <code className="bg-gray-100 px-1 rounded">https://hooks.slack.com/...</code></li>
              </ol>
            </div>

            <div id="telegram" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Telegram</h3>
              <p className="mb-3">You need a Bot Token and a Chat ID.</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Message <strong>@BotFather</strong> on Telegram → create a new bot → copy the token</li>
                <li>Start a chat with your bot, then visit <code className="bg-gray-100 px-1 rounded">https://api.telegram.org/bot&lt;token&gt;/getUpdates</code> to find your Chat ID</li>
                <li>Enter both the Bot Token and Chat ID in CheckAPI</li>
              </ol>
            </div>

            <div id="discord" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Discord</h3>
              <p className="mb-3">Create a Webhook in your Discord server channel settings.</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Go to your Discord server → channel settings → Integrations → Webhooks</li>
                <li>Create a new webhook and copy the URL</li>
                <li>Paste the URL starting with <code className="bg-gray-100 px-1 rounded">https://discord.com/api/webhooks/...</code></li>
              </ol>
            </div>

            <div id="webhook">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Custom Webhook</h3>
              <p className="mb-4">CheckAPI will POST to your URL whenever a monitor status changes. The payload looks like:</p>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-sm overflow-x-auto leading-relaxed">
{`{
  "event": "status_changed",
  "monitor": {
    "id": "abc123",
    "name": "Production API",
    "url": "https://api.example.com/health"
  },
  "status": {
    "old": "up",
    "new": "down"
  },
  "timestamp": "2026-03-07T12:00:00Z"
}`}
              </pre>
            </div>
          </section>

          {/* Plans */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b border-gray-200">Plans & Limits</h2>

            <div id="free-plan" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Free Plan</h3>
              <p>
                The free plan includes <strong className="text-gray-800">10 monitors</strong> with 5-minute check intervals and 7-day data retention — with <strong className="text-gray-800">no commercial-use restrictions</strong>. Most monitoring tools restrict their free tier to personal projects only. CheckAPI doesn't.
              </p>
            </div>

            <div id="paid-plans" className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Paid Plans</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Monitors</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Interval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-3">Free</td><td className="px-4 py-3">$0</td><td className="px-4 py-3">10</td><td className="px-4 py-3">5 min</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-3">Starter</td><td className="px-4 py-3">$5/mo</td><td className="px-4 py-3">20</td><td className="px-4 py-3">1 min</td></tr>
                    <tr><td className="px-4 py-3">Pro</td><td className="px-4 py-3">$15/mo</td><td className="px-4 py-3">100</td><td className="px-4 py-3">30 sec</td></tr>
                    <tr className="bg-gray-50"><td className="px-4 py-3">Business</td><td className="px-4 py-3">$49/mo</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">10 sec</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div id="data-retention">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Retention</h3>
              <p className="mb-4">Check history is retained for:</p>
              <ul className="space-y-1 text-sm">
                <li>• <strong className="text-gray-800">Free:</strong> 7 days</li>
                <li>• <strong className="text-gray-800">Starter:</strong> 30 days</li>
                <li>• <strong className="text-gray-800">Pro:</strong> 90 days</li>
                <li>• <strong className="text-gray-800">Business:</strong> 365 days</li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section className="bg-green-50 rounded-2xl border border-green-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h2>
            <p className="text-gray-600 mb-5">We're happy to help. Reach out and we'll get back to you quickly.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium">
              Contact Support
            </Link>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">CheckAPI</h3>
              <p className="text-gray-600 text-sm">Simple, reliable API monitoring for developers and teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/#features" className="hover:text-green-600">Features</a></li>
                <li><a href="/#pricing" className="hover:text-green-600">Pricing</a></li>
                <li><Link href="/docs" className="hover:text-green-600">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-green-600">About</Link></li>
                <li><Link href="/blog" className="hover:text-green-600">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-green-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-green-600">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            © 2026 CheckAPI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
