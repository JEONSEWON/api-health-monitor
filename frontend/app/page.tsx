import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                API Health Monitor
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 transition">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-green-600 transition">Pricing</a>
              <a href="#docs" className="text-gray-700 hover:text-green-600 transition">Docs</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-700 hover:text-green-600 transition"
              >
                Log in
              </Link>
              <Link 
                href="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Monitor Your APIs
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              24/7 Uptime Tracking
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant alerts when your APIs go down. Simple setup, powerful monitoring, 
            and affordable pricing for developers and teams.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register"
              className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#pricing"
              className="inline-flex items-center justify-center border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition text-lg font-medium"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free plan available • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Demo Dashboard Preview */}
        <div className="mt-16 rounded-xl border-4 border-gray-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Monitors</h3>
                <span className="text-sm text-green-600 font-medium">All systems operational ✓</span>
              </div>
              <div className="space-y-3">
                {['Production API', 'Staging Environment', 'CDN Endpoint'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">{name}</span>
                    </div>
                    <span className="text-sm text-gray-500">99.8% uptime</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to monitor your APIs
          </h2>
          <p className="text-xl text-gray-600">
            Simple, powerful, and affordable monitoring for modern teams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-green-600" />}
            title="Real-time Monitoring"
            description="Check your APIs every minute. Get instant alerts when something goes wrong."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-green-600" />}
            title="Multi-channel Alerts"
            description="Email, Slack, Telegram, Discord, or custom webhooks. You choose how to be notified."
          />
          <FeatureCard 
            icon={<BarChart3 className="h-8 w-8 text-green-600" />}
            title="Detailed Analytics"
            description="Track uptime, response times, and incidents. Visualize trends over time."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you grow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PricingCard 
            name="Free"
            price="$0"
            features={['3 monitors', '5-minute checks', 'Email alerts', 'Public status page']}
            cta="Start Free"
            href="/register"
          />
          <PricingCard 
            name="Starter"
            price="$5"
            popular
            features={['20 monitors', '1-minute checks', 'All alert channels', 'Analytics']}
            cta="Get Started"
            href="/register"
          />
          <PricingCard 
            name="Pro"
            price="$15"
            features={['100 monitors', '30-second checks', 'Team sharing', 'Priority support']}
            cta="Get Started"
            href="/register"
          />
          <PricingCard 
            name="Business"
            price="$49"
            features={['Unlimited monitors', '10-second checks', 'API access', 'Custom features', 'SLA']}
            cta="Get Started"
            href="/register"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start monitoring in 60 seconds
          </h2>
          <p className="text-xl text-green-100 mb-8">
            No credit card required. Free plan available.
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center justify-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition text-lg font-medium"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">API Health Monitor</h3>
              <p className="text-gray-600 text-sm">
                Simple, reliable API monitoring for developers and teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-green-600">Features</a></li>
                <li><a href="#pricing" className="hover:text-green-600">Pricing</a></li>
                <li><a href="#docs" className="hover:text-green-600">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600">About</a></li>
                <li><a href="#" className="hover:text-green-600">Blog</a></li>
                <li><a href="#" className="hover:text-green-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600">Privacy</a></li>
                <li><a href="#" className="hover:text-green-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            © 2026 API Health Monitor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  features, 
  cta, 
  href, 
  popular 
}: { 
  name: string; 
  price: string; 
  features: string[]; 
  cta: string; 
  href: string; 
  popular?: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-xl border-2 ${popular ? 'border-green-600 shadow-xl scale-105' : 'border-gray-200'}`}>
      {popular && (
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAR
        </span>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mt-4">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-gray-700">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link 
        href={href}
        className={`block text-center px-6 py-3 rounded-lg font-medium transition ${
          popular 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
