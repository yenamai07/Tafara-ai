'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-tafara-dark via-tafara-blue to-tafara-dark opacity-90"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-tafara-teal/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-tafara-cyan/20 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-6 py-20">
          {/* Logo and Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-tafara-teal/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <img 
                  src="/logo.png" 
                  alt="Tafara.ai Logo" 
                  className="relative w-48 h-48 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-tafara-cyan via-tafara-teal to-tafara-cyan bg-clip-text text-transparent animate-gradient">
              Tafara.ai
            </h1>
            <p className="text-2xl md:text-3xl text-tafara-cyan font-light mb-4">
              FREE & EASY AI FOR ALL
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Build your own AI assistant without writing a single line of code. 
              Private, powerful, and accessible to everyone.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            <FeatureCard 
              icon="🔒"
              title="Secure by Design"
              description="Your data is protected with industry-standard encryption. API keys never touch your browser - all requests are handled server-side."
            />
            <FeatureCard 
              icon="🎨"
              title="No Code Required"
              description="Build sophisticated AI assistants with our simple, intuitive interface."
            />
            <FeatureCard 
              icon="🌍"
              title="Truly Free"
              description="No hidden costs, no ads, no donations. Just pure AI power for everyone."
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-lg text-tafara-dark hover:shadow-2xl hover:shadow-tafara-teal/50 transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Start Building Now</span>
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              href="/learn"
              className="px-8 py-4 border-2 border-tafara-teal rounded-lg font-semibold text-lg text-tafara-teal hover:bg-tafara-teal/10 transform hover:scale-105 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-20 bg-gradient-to-b from-transparent to-tafara-dark/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-tafara-cyan">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <Step 
              number="1"
              title="Get Your API Key"
              description="Use our shared key (with login) or bring your own OpenRouter API key."
            />
            <Step 
              number="2"
              title="Configure Your AI"
              description="Set personality, behavior, and knowledge in plain English. No coding needed."
            />
            <Step 
              number="3"
              title="Start Chatting"
              description="Your custom AI is ready! Use it on any device, anytime, anywhere."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 border-t border-tafara-teal/20">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>Built with ❤️ for the AI community</p>
          <p className="text-sm mt-2">Tafara.ai - Empowering everyone to build AI</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="group relative bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8 hover:border-tafara-teal hover:shadow-xl hover:shadow-tafara-teal/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-tafara-teal/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-3 text-tafara-cyan">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-tafara-teal to-tafara-cyan rounded-full text-2xl font-bold text-tafara-dark mb-6 shadow-lg shadow-tafara-teal/50">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
