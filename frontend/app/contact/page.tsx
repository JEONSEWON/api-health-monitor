'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, Twitter } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">CheckAPI</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="/#features" className="text-gray-700 hover:text-green-600 transition">Features</a>
              <a href="/#pricing" className="text-gray-700 hover:text-green-600 transition">Pricing</a>
              <Link href="/docs" className="text-gray-700 hover:text-green-600 transition">Docs</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-green-600 transition">Log in</Link>
              <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Get in<br /><span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Touch</span></h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Have a question or need help? We typically respond within a few hours.</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Mail className="h-8 w-8 text-green-600" />, title: 'Email', description: 'For general inquiries and support.', action: 'support@checkapi.io', href: 'mailto:support@checkapi.io' },
            { icon: <MessageCircle className="h-8 w-8 text-green-600" />, title: 'Live Chat', description: 'Chat with us directly from the dashboard.', action: 'Open Dashboard', href: '/dashboard' },
            { icon: <Twitter className="h-8 w-8 text-green-600" />, title: 'Twitter / X', description: 'DM us or mention us for quick responses.', action: '@imwon_dev', href: 'https://x.com/imwon_dev' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <a href={item.href} className="text-green-600 font-medium hover:text-green-700 transition">{item.action}</a>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Send a Message</h2>
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
              <p className="text-gray-600">We will get back to you within a few hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none text-gray-900" placeholder="Tell us more..." />
              </div>
              {status === 'error' && <p className="text-red-600 text-sm">Something went wrong. Please try again or email us directly.</p>}
              <button type="submit" disabled={status === 'loading'} className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium disabled:opacity-60">
                {status === 'loading' ? 'Sending...' : 'Send Message'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start monitoring your APIs today</h2>
          <p className="text-xl text-green-100 mb-8">Free plan available. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center justify-center bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition text-lg font-medium">Get Started Free<ArrowRight className="ml-2 h-5 w-5" /></Link>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div><h3 className="font-bold text-gray-900 mb-4">CheckAPI</h3><p className="text-gray-600 text-sm">Simple, reliable API monitoring for developers and teams.</p></div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Product</h4><ul className="space-y-2 text-sm text-gray-600"><li><a href="/#features" className="hover:text-green-600">Features</a></li><li><a href="/#pricing" className="hover:text-green-600">Pricing</a></li><li><Link href="/docs" className="hover:text-green-600">Documentation</Link></li></ul></div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Company</h4><ul className="space-y-2 text-sm text-gray-600"><li><Link href="/about" className="hover:text-green-600">About</Link></li><li><Link href="/blog" className="hover:text-green-600">Blog</Link></li><li><Link href="/contact" className="hover:text-green-600">Contact</Link></li></ul></div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-600"><li><Link href="/privacy" className="hover:text-green-600">Privacy</Link></li><li><Link href="/terms" className="hover:text-green-600">Terms</Link></li></ul></div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">© 2026 CheckAPI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}