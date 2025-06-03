'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navigation from '../components/Navigation'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      title: "Never Run Out of Content Ideas Again",
      description: "Transform your blank page anxiety into endless inspiration. Our AI generates content ideas so good, your audience will think you hired a team of creative directors.",
      icon: "💡"
    },
    {
      title: "Turn One Idea Into 50+ Posts",
      description: "Watch a single piece of content multiply across platforms automatically. What used to take hours of manual work now happens while you sleep.",
      icon: "🔄"
    },
    {
      title: "Post Everywhere, Manage Nowhere",
      description: "Reach your audience on 10+ platforms without logging into a single social media account. Your content shows up everywhere your customers are.",
      icon: "🎯"
    },
    {
      title: "Your Social Media Runs on Autopilot",
      description: "Set it once, profit forever. Your social media presence grows 24/7 while you focus on what actually makes you money.",
      icon: "🚀"
    },
    {
      title: "Look Like You Have a Marketing Team",
      description: "Professional, consistent posting across all platforms makes you look like a Fortune 500 company, even if you're a team of one.",
      icon: "👥"
    },
    {
      title: "Know What Actually Works",
      description: "Stop guessing what your audience wants. Get clear data on what drives engagement, sales, and growth across every platform.",
      icon: "📈"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "E-commerce Owner",
      company: "StyleCraft Boutique",
      content: "I went from posting randomly twice a week to having a professional presence on 8 platforms. My sales doubled in 3 months.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Fitness Coach",
      company: "Peak Performance",
      content: "Lumos Arc gave me my life back. I spend 30 minutes a week on content and get better results than when I was posting manually every day.",
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "Restaurant Owner", 
      company: "Casa Elena",
      content: "Our engagement increased 400% and we're booked solid every weekend. People think we have a full marketing team!",
      avatar: "ER"
    }
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: 9,
      description: "Perfect for solopreneurs ready to automate their social presence",
      features: [
        "50 AI-generated content ideas/month",
        "Auto-repurpose to 5 platforms",
        "Basic scheduling automation",
        "Email support",
        "Content calendar view"
      ],
      popular: false
    },
    {
      name: "Professional", 
      price: 29,
      description: "For businesses serious about social media growth",
      features: [
        "200 AI-generated content ideas/month",
        "Auto-repurpose to 10+ platforms",
        "Advanced scheduling & automation",
        "Team collaboration (up to 5 users)",
        "Performance analytics dashboard",
        "Priority support",
        "Custom content templates"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For agencies and large businesses scaling fast",
      features: [
        "Unlimited content ideas",
        "Unlimited platforms & automation",
        "White-label solution",
        "Unlimited team members",
        "Advanced analytics & reporting",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 phone support"
      ],
      popular: false
    }
  ]

  const platforms = [
    { name: "Facebook", logo: "📘" },
    { name: "Instagram", logo: "📷" },
    { name: "Twitter/X", logo: "🐦" },
    { name: "LinkedIn", logo: "💼" },
    { name: "TikTok", logo: "🎵" },
    { name: "YouTube", logo: "📹" },
    { name: "Pinterest", logo: "📌" },
    { name: "Threads", logo: "🧵" },
    { name: "Bluesky", logo: "🌌" },
    { name: "Google Business", logo: "🏢" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Struggling With Social Media.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Start Dominating It. </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The first social automation platform that thinks, creates, and posts for you. 
              Generate unlimited content ideas, auto-repurpose across 10+ platforms, and schedule everything while you sleep.
              <strong className="text-gray-800"> Finally, social media that works FOR you, not against you.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pricing" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Free Trial
              </Link>
              <Link 
                href="#demo" 
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Watch 2-Min Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • Setup in under 5 minutes • Cancel anytime</p>
          </div>

          {/* Hero Demo */}
          <div className="mt-16 relative" id="demo">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="ml-4 text-sm text-gray-500">app.lumos-arc.com/dashboard</span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">1. Tell Us Your Business</h3>
                    <div className="space-y-3">
                      <input 
                        placeholder="Enter your business niche..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                        value="Digital Marketing Agency"
                        readOnly
                      />
                      <input 
                        placeholder="Target keywords..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                        value="SEO, content marketing, lead generation"
                        readOnly
                      />
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Generate & Auto-Schedule ✨
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">2. Watch The Magic Happen</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-semibold text-gray-900">5 SEO Mistakes Killing Your Rankings</div>
                        <p className="text-gray-700 text-sm mt-1">Auto-scheduled to: LinkedIn, Twitter, Facebook</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="font-semibold text-gray-900">How to Generate 100 Leads in 30 Days</div>
                        <p className="text-gray-700 text-sm mt-1">Auto-scheduled to: Instagram, TikTok, YouTube</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="font-semibold text-gray-900">Content Marketing That Actually Converts</div>
                        <p className="text-gray-700 text-sm mt-1">Auto-scheduled to: Pinterest, Threads, Bluesky</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800 font-medium">🎯 30 days of content scheduled across 10 platforms in 3 minutes!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section id="platforms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Reach Your Audience Everywhere They Are
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One click. Ten platforms. Maximum reach. Your content automatically optimized for each platform's unique audience and algorithm.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {platforms.map((platform, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-3">{platform.logo}</div>
                <div className="text-sm font-medium text-gray-900">{platform.name}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600 mb-6">Plus automatic optimization for each platform's unique requirements:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">📱 Mobile-First Formats</h4>
                <p className="text-gray-600 text-sm">Perfect sizing for Instagram Stories, TikTok videos, and mobile feeds</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">💼 Professional Tone</h4>
                <p className="text-gray-600 text-sm">LinkedIn-optimized content that builds authority and drives B2B results</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Platform-Specific CTAs</h4>
                <p className="text-gray-600 text-sm">Optimized calls-to-action that work on each platform's unique user behavior</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Results Speak for Themselves
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop wasting time on social media busywork. Start getting the results that actually matter to your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Businesses, Real Results
            </h2>
            <p className="text-xl text-gray-600">
              See how Lumos Arc is helping businesses break through the social media noise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">300%</div>
              <div className="text-gray-600">Average engagement increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">15hrs</div>
              <div className="text-gray-600">Saved per week on average</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">10+</div>
              <div className="text-gray-600">Platforms automated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Your social presence working</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Growth Plan
            </h2>
            <p className="text-xl text-gray-600">
              Stop paying for features you don't need. Start with automation that actually drives results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative p-8 border rounded-xl ${
                tier.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-gray-900">${tier.price}</span>
                    <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-gray-600">{tier.description}</p>
                </div>

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={`/auth/register?tier=${tier.name.toLowerCase()}`}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium ${
                      tier.popular
                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                        : 'text-blue-600 bg-white border-blue-600 hover:bg-blue-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Stop Fighting Social Media and Start Winning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of smart business owners who automated their way to social media success
          </p>
          <Link 
            href="/pricing" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Start Your Free Trial - No Credit Card Required
          </Link>
          <p className="text-blue-100 text-sm mt-4">Setup takes less than 5 minutes • Cancel anytime • 14-day money-back guarantee</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LA</span>
                </div>
                <span className="text-xl font-bold">Lumos Arc</span>
              </div>
              <p className="text-gray-400">
                The social automation platform that thinks, creates, and posts for you across 10+ platforms.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#platforms" className="hover:text-white">Platforms</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Lumos Arc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}