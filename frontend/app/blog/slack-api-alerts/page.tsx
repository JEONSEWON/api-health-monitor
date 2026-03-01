import Link from 'next/link';
import { ArrowRight, CheckCircle, Calendar, Clock } from 'lucide-react';

export const metadata = {
  title: 'How to Set Up Slack Alerts for API Downtime in 5 Minutes | CheckAPI',
  description: 'Step-by-step guide to getting instant Slack notifications when your API goes down. No code required. Works with CheckAPI free plan.',
};

export default function BlogPost3() {
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
              <Link href="/docs" className="text-gray-700 hover:text-green-600 transition">Docs</Link>
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

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-green-600">Blog</Link>
          <span>/</span>
          <span>Slack API Alerts</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          How to Set Up Slack Alerts for API Downtime in 5 Minutes
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-10">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Jan 28, 2026</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />3 min read</span>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700 leading-relaxed">

          <p className="text-xl text-gray-600">
            Email alerts are fine. But when your API goes down at 2am, you want a Slack ping — not an email you'll see at 9am. Here's how to set it up in under 5 minutes.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <p className="text-green-800 font-medium">
              ✅ Slack alerts are available on CheckAPI's free plan. No upgrade required.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">What You'll Need</h2>
          <ul className="space-y-2">
            {[
              'A CheckAPI account (free)',
              'A Slack workspace where you have permission to add apps',
              '5 minutes',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Step 1: Create a Slack Webhook</h2>
          <p>First, you need an Incoming Webhook URL from Slack. This is the URL CheckAPI will send alerts to.</p>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-4">
            {[
              { step: '1', text: 'Go to api.slack.com/apps and click "Create New App"' },
              { step: '2', text: 'Choose "From scratch", give it a name like "CheckAPI Alerts", and select your workspace' },
              { step: '3', text: 'In the left sidebar, click "Incoming Webhooks"' },
              { step: '4', text: 'Toggle "Activate Incoming Webhooks" to On' },
              { step: '5', text: 'Click "Add New Webhook to Workspace" and choose the channel where you want alerts' },
              { step: '6', text: 'Copy the Webhook URL — it looks like https://hooks.slack.com/services/...' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">{item.step}</span>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Step 2: Add the Webhook to CheckAPI</h2>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-4">
            {[
              { step: '1', text: 'Log into your CheckAPI dashboard' },
              { step: '2', text: 'Go to "Alert Channels" in the sidebar' },
              { step: '3', text: 'Click "Add Channel" and select Slack' },
              { step: '4', text: 'Paste your Webhook URL and give it a name (e.g. "#incidents channel")' },
              { step: '5', text: 'Click "Test Alert" to confirm it works — you should see a test message in your Slack channel' },
              { step: '6', text: 'Save and attach the channel to your monitors' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">{item.step}</span>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">What Alerts Look Like</h2>
          <p>When your API goes down, you'll get a Slack message that includes:</p>
          <ul className="space-y-2">
            {[
              'Which monitor went down',
              'The URL that failed',
              'The HTTP status code (or timeout)',
              'The exact time it went down',
              'A direct link to the monitor in your dashboard',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>When it comes back up, you'll get a recovery alert too — so you know when the issue is resolved.</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Other Alert Channels</h2>
          <p>CheckAPI also supports Telegram, Discord, and custom webhooks — all on the free plan. The setup process is similar: get a webhook URL, paste it in, test it.</p>

          <div className="grid grid-cols-3 gap-4">
            {['📱 Telegram', '🎮 Discord', '🔗 Custom Webhook'].map((channel, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center text-gray-700 font-medium">
                {channel}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center mt-12">
            <h3 className="text-2xl font-bold text-white mb-3">Never miss downtime again</h3>
            <p className="text-green-100 mb-6">Set up Slack alerts in 5 minutes. Free plan, no credit card.</p>
            <Link href="/register" className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

        </div>
      </article>

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
