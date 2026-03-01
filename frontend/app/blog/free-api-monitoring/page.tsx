import Link from 'next/link';
import { ArrowRight, CheckCircle, Calendar, Clock } from 'lucide-react';

export const metadata = {
  title: 'How to Monitor Your API for Free in 2026 | CheckAPI',
  description: 'A practical guide to setting up free API monitoring that actually works — with real alerts, no credit card required, and no commercial restrictions.',
};

export default function BlogPost2() {
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
          <span>Free API Monitoring</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          How to Monitor Your API for Free (And Actually Get Alerted)
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-10">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Feb 10, 2026</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />4 min read</span>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700 leading-relaxed">

          <p className="text-xl text-gray-600">
            Your API went down last night. You found out at 9am when a user emailed you. Sound familiar? Here's how to make sure that never happens again — for free.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Why Most "Free" Monitoring Falls Short</h2>
          <p>
            Most free monitoring tiers have at least one catch. Either you only get 1 or 2 monitors (useless for a real project), alerts are locked behind a paywall, check intervals are too slow (10–30 minutes means your API could be down for half an hour before you know), or commercial use is restricted.
          </p>
          <p>
            The good news: there are tools that get this right. Here's how to set up solid free monitoring in under 10 minutes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Step-by-Step: Set Up Free API Monitoring</h2>

          {/* Step 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</span>
              <h3 className="text-xl font-bold text-gray-900">Create a free account</h3>
            </div>
            <p className="text-gray-600 ml-14">
              Sign up at <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">checkapi.io/register</Link>. No credit card required. Takes 30 seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</span>
              <h3 className="text-xl font-bold text-gray-900">Add your first monitor</h3>
            </div>
            <div className="text-gray-600 ml-14 space-y-3">
              <p>Click "Add Monitor" and enter:</p>
              <ul className="space-y-2">
                {[
                  'Your API URL (e.g. https://api.yourapp.com/health)',
                  'Expected status code (usually 200)',
                  'Check interval (5 minutes on free plan)',
                  'A name to identify it',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</span>
              <h3 className="text-xl font-bold text-gray-900">Set up an alert channel</h3>
            </div>
            <p className="text-gray-600 ml-14">
              Add your email for instant alerts. On the free plan, email alerts are included. You can also connect Slack, Telegram, or Discord — all supported on the free tier.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">4</span>
              <h3 className="text-xl font-bold text-gray-900">Test it</h3>
            </div>
            <p className="text-gray-600 ml-14">
              Use the "Test Alert" button to make sure you receive a notification. Better to find out it's misconfigured now than at 3am when your API is actually down.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">What to Monitor</h2>
          <p>At minimum, monitor these endpoints:</p>
          <ul className="space-y-3">
            {[
              { endpoint: '/health or /ping', reason: 'Basic availability check' },
              { endpoint: 'Your most critical API endpoint', reason: 'Core functionality' },
              { endpoint: 'Your login/auth endpoint', reason: 'Users can\'t do anything without it' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span><code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{item.endpoint}</code> — {item.reason}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12">Pro Tips</h2>
          <div className="space-y-4">
            {[
              { tip: 'Add a /health endpoint to your API', detail: 'Return a simple {"status": "ok"} with a 200. This is the standard pattern and makes monitoring much cleaner.' },
              { tip: 'Monitor response time, not just status', detail: 'An API that returns 200 but takes 8 seconds is effectively broken for your users. Set a response time threshold.' },
              { tip: 'Set up a public status page', detail: 'Proactively share uptime with your users so they can check before emailing you.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-2">💡 {item.tip}</h4>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center mt-12">
            <h3 className="text-2xl font-bold text-white mb-3">Set up monitoring in 60 seconds</h3>
            <p className="text-green-100 mb-6">Free plan. No credit card. Commercial use allowed.</p>
            <Link href="/register" className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
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
