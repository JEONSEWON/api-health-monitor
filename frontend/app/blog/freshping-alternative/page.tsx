import PublicAuthButtons from '@/components/PublicAuthButtons';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle, Calendar, Clock, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Freshping Shut Down: Best Free Alternatives in 2026 | CheckAPI',
  description: 'Freshping shut down in March 2026 and all data will be deleted June 4, 2026. Here are the best free Freshping alternatives for API and uptime monitoring — migrate in minutes.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why did Freshping shut down?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Freshworks shut down Freshping in March 2026. Free accounts were disabled on March 6, 2026, and all user data will be permanently deleted on June 4, 2026. Freshworks has not provided a public explanation for the shutdown.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best free Freshping alternative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The best free Freshping alternative in 2026 is CheckAPI. It offers 5 free monitors with 5-minute check intervals, all alert channels (Email, Slack, Telegram, Discord, Webhook) included on the free plan, and commercial use is explicitly allowed. Migration takes under 5 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I migrate from Freshping before data is deleted?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To migrate from Freshping: 1) Export your monitor list from Freshping dashboard. 2) Sign up for a free alternative like CheckAPI. 3) Re-add your monitor URLs. 4) Set up alert channels (Slack, email, etc). The whole process takes under 10 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free Freshping alternative with 1-minute checks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CheckAPI Starter plan offers 1-minute checks for $5/month. For free alternatives with fast checks, Better Stack offers 3-minute checks on their free tier. Freshping was unusually generous with 1-minute free checks — most alternatives charge for sub-5-minute intervals.',
      },
    },
  ],
};

export default function FreshpingAlternativePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                CheckAPI
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="/#features" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition">Features</a>
              <a href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition">Pricing</a>
              <Link href="/docs" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition">Docs</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <PublicAuthButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/blog" className="hover:text-green-600">Blog</Link>
          <span>/</span>
          <span>Freshping Alternative</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Freshping Shut Down: Best Free Alternatives in 2026
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-10">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />May 18, 2026</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />5 min read</span>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">

          {/* Urgent banner */}
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-300 font-semibold mb-1">Freshping is shut down</p>
                <p className="text-red-700 dark:text-red-400 text-sm mb-0">
                  Freshworks shut down Freshping on March 6, 2026. All user data will be <strong>permanently deleted on June 4, 2026</strong>. If you haven't migrated yet, now is the time.
                </p>
              </div>
            </div>
          </div>

          <p>
            Freshping was one of the most generous free monitoring tools ever — 50 monitors, 1-minute checks, 10 global locations, all for free. That made its sudden shutdown in March 2026 a real blow for thousands of developers and small teams who relied on it.
          </p>
          <p>
            If you're looking for a replacement, here's a no-fluff comparison of the best free Freshping alternatives, including how to migrate in minutes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12">Why Did Freshping Shut Down?</h2>
          <p>
            Freshworks hasn't given a public reason. The most likely explanation is that Freshping was a loss-leader that never converted enough users to paid Freshworks products to justify its infrastructure costs. Running 1-minute global checks for free across hundreds of thousands of monitors is expensive.
          </p>
          <p>
            Whatever the reason, the practical reality is: your monitors are gone, your alerts are silent, and the data deletion deadline is <strong>June 4, 2026</strong>.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12">The Best Free Freshping Alternatives</h2>

          {/* CheckAPI */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1. CheckAPI</h3>
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-bold px-3 py-1 rounded-full">Best Overall</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              CheckAPI is built specifically for API and uptime monitoring. The free plan gives you 5 monitors with all alert channels included — Slack, Telegram, Discord, and Webhook are all available even on the free tier, which is rare.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The standout feature is <strong>Silent Failure Detection</strong>: CheckAPI can alert you when your API returns HTTP 200 but the response body is wrong — a common failure mode that basic uptime checkers miss entirely.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Free monitors', value: '5', ok: true },
                { label: 'Check interval', value: '5 min', ok: true },
                { label: 'Commercial use', value: 'Allowed ✓', ok: true },
                { label: 'Alert channels', value: 'Email, Slack, Telegram, Discord, Webhook', ok: true },
                { label: 'Status page', value: 'Yes (public)', ok: true },
                { label: 'Silent failure detection', value: 'Yes (unique)', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">{item.label}:</span> {item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium">
              Migrate to CheckAPI Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Better Stack */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Better Stack</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Better Stack has evolved into a full observability platform (logs, metrics, on-call scheduling) but its uptime monitoring is still solid. The free plan is more limited than Freshping was, but the product quality and UI are excellent.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Free monitors', value: '10', ok: true },
                { label: 'Check interval', value: '3 min', ok: true },
                { label: 'Commercial use', value: 'Allowed', ok: true },
                { label: 'Status page', value: 'Yes', ok: true },
                { label: 'Slack alerts (free)', value: 'No (paid only)', ok: false },
                { label: 'Webhook (free)', value: 'No (paid only)', ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {item.ok
                    ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">{item.label}:</span> {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* UptimeRobot */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3. UptimeRobot</h3>
              <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-sm font-medium px-3 py-1 rounded-full">⚠️ No commercial use (free)</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              UptimeRobot offers 50 free monitors — the most of any alternative. But since October 2024, their Terms of Service <strong>prohibit commercial use on the free plan</strong>. If you're running a business, side project, or any revenue-generating service, you technically need a paid plan ($9/mo+).
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Free monitors', value: '50', ok: true },
                { label: 'Check interval', value: '5 min', ok: true },
                { label: 'Commercial use', value: 'NOT allowed (free)', ok: false },
                { label: 'Slack alerts (free)', value: 'Yes', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {item.ok
                    ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">{item.label}:</span> {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Uptime Kuma */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4. Uptime Kuma (Self-hosted)</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-full">Open source</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Uptime Kuma is a free, self-hosted monitoring tool with a nice UI. It's technically unlimited since you run it yourself. The downside: you're responsible for hosting, uptime of the monitoring server itself, and maintenance. Not ideal if you just want a quick plug-and-play replacement for Freshping.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Monitors', value: 'Unlimited (self-hosted)', ok: true },
                { label: 'Check interval', value: '60s+', ok: true },
                { label: 'Commercial use', value: 'Yes (MIT license)', ok: true },
                { label: 'Requires server', value: 'Yes (your own)', ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {item.ok
                    ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">{item.label}:</span> {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12">Freshping Alternatives Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Tool</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Free Monitors</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Interval</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Commercial</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Free Slack/Webhook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  { name: 'CheckAPI', monitors: '5', interval: '5 min', commercial: true, slack: true, highlight: true },
                  { name: 'Better Stack', monitors: '10', interval: '3 min', commercial: true, slack: false, highlight: false },
                  { name: 'UptimeRobot', monitors: '50', interval: '5 min', commercial: false, slack: true, highlight: false },
                  { name: 'Uptime Kuma', monitors: '∞ (self-hosted)', interval: '60s+', commercial: true, slack: true, highlight: false },
                  { name: 'Freshping', monitors: '—', interval: '—', commercial: null, slack: null, highlight: false, shutdown: true },
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? 'bg-green-50 dark:bg-green-950' : row.shutdown ? 'bg-red-50 dark:bg-red-950 opacity-60' : ''}>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {row.shutdown ? <span className="line-through">{row.name}</span> : row.name}
                      {row.highlight && <span className="ml-2 text-xs text-green-600 font-bold">← Recommended</span>}
                      {row.shutdown && <span className="ml-2 text-xs text-red-600 font-bold">SHUT DOWN</span>}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{row.monitors}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{row.interval}</td>
                    <td className="p-4">
                      {row.commercial === null ? <span className="text-gray-400">—</span> :
                       row.commercial ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-400" />}
                    </td>
                    <td className="p-4">
                      {row.slack === null ? <span className="text-gray-400">—</span> :
                       row.slack ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Migration guide */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12">How to Migrate from Freshping in 5 Minutes</h2>
          <p>Migration is simpler than it sounds. Here's the exact process for CheckAPI:</p>

          <div className="space-y-4">
            {[
              { step: '1', title: 'Export your Freshping monitors', desc: 'Log into Freshping while you still can. Go to Settings → Export and note down your monitor URLs, methods, and alert channels.' },
              { step: '2', title: 'Sign up for CheckAPI', desc: 'Create a free account at checkapi.io. No credit card required.' },
              { step: '3', title: 'Add your monitors', desc: 'Click "New Monitor" and paste your URLs. Set your expected status code and optionally add keyword or JSON Path assertions for deeper health checks.' },
              { step: '4', title: 'Set up alert channels', desc: 'Connect your Slack workspace, Telegram bot, or email — all free. CheckAPI also supports Discord and custom webhooks.' },
              { step: '5', title: 'Verify everything is working', desc: 'Check the dashboard after 5–10 minutes. Your monitors will show green if your endpoints are up.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12">Which Freshping Alternative Should You Choose?</h2>
          <p>
            For most developers and small teams: <strong>CheckAPI</strong>. It's the only free alternative that includes all alert channels (Slack, Telegram, Discord, Webhook) without a paywall, explicitly allows commercial use, and has silent failure detection built in.
          </p>
          <p>
            If you need 10+ free monitors and don't need Slack/Webhook on the free tier, <strong>Better Stack</strong> is a solid choice with a polished UI.
          </p>
          <p>
            If you were only using Freshping for personal projects and the commercial restriction doesn't apply to you, <strong>UptimeRobot</strong>'s 50 free monitors are hard to beat on quantity alone.
          </p>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center mt-12">
            <h3 className="text-2xl font-bold text-white mb-3">Migrate from Freshping in 5 minutes</h3>
            <p className="text-green-100 mb-2">Free plan · No credit card · Commercial use allowed</p>
            <p className="text-green-200 text-sm mb-6">All alert channels included — Slack, Telegram, Discord, Webhook</p>
            <Link href="/register" className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

        </div>
      </article>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">CheckAPI</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Simple, reliable API monitoring for developers and teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="/#features" className="hover:text-green-600">Features</a></li>
                <li><a href="/pricing" className="hover:text-green-600">Pricing</a></li>
                <li><Link href="/docs" className="hover:text-green-600">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-green-600">About</Link></li>
                <li><Link href="/blog" className="hover:text-green-600">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-green-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-green-600">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400 dark:border-gray-800">
            © 2026 CheckAPI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
