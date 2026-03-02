import Link from 'next/link';

export default function PrivacyPage() {
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

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Privacy{' '}
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Policy
          </span>
        </h1>
        <p className="text-gray-500">Last updated: February 1, 2026</p>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm space-y-10 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p>When you create an account, we collect your email address and password (hashed). When you add monitors, we store the URLs and configuration you provide. We also collect basic usage data such as check results, response times, and incident logs to power your dashboard.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p>We use your information solely to provide and improve the CheckAPI service — running health checks on your endpoints, sending alerts through your configured channels, and displaying analytics in your dashboard. We do not sell your data to third parties.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Alert Channels</h2>
            <p>If you connect Slack, Telegram, Discord, or other alert channels, we store only the webhook URLs or tokens necessary to deliver alerts. We do not access or store any other data from those platforms.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
            <p>Monitor check history is retained for 7 days on the Free plan, 30 days on Starter, 90 days on Pro, and 1 year on Business. You may delete your account and all associated data at any time from your account settings.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
            <p>We use minimal cookies — only what is necessary for authentication and session management. We do not use tracking or advertising cookies.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security</h2>
            <p>All data is transmitted over HTTPS. Passwords are hashed and never stored in plain text. We take reasonable measures to protect your data, though no system is 100% secure.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact</h2>
            <p>If you have questions about this policy, please contact us at <a href="mailto:support@checkapi.io" className="text-green-600 hover:text-green-700">support@checkapi.io</a>.</p>
          </div>

        </div>
      </section>

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
