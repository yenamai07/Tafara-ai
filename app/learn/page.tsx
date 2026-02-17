'use client'

import Link from 'next/link'

export default function Learn() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-tafara-cyan hover:text-tafara-teal mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-tafara-cyan mb-8">How to Use Tafara.ai</h1>

        <div className="space-y-8">
          <Section title="Getting Started">
            <div className="space-y-4">
              <Step 
                title="1. Choose Your API Key Option"
                description="You have two choices:"
              />
              <ul className="list-disc list-inside text-gray-300 ml-6 space-y-2">
                <li><strong className="text-tafara-cyan">Shared Key:</strong> If you have login credentials, you can use our shared OpenRouter key</li>
                <li><strong className="text-tafara-cyan">Your Own Key:</strong> Get a free API key from OpenRouter and use your own</li>
              </ul>
            </div>
          </Section>

          <Section title="Getting Your Own API Key">
            <div className="space-y-4 text-gray-300">
              <p>If you want to use your own OpenRouter API key (recommended for unlimited use):</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-tafara-cyan hover:text-tafara-teal underline">OpenRouter.ai</a></li>
                <li>Sign up for a free account (you can use Google, GitHub, or email)</li>
                <li>Navigate to the "Keys" section in your dashboard</li>
                <li>Click "Create Key" and give it a name (e.g., "Tafara AI")</li>
                <li>Copy your API key (it starts with "sk-or-...")</li>
                <li>Paste it into Tafara.ai when prompted</li>
              </ol>
              <div className="bg-tafara-teal/10 border border-tafara-teal/30 rounded-lg p-4 mt-4">
                <p className="text-sm">💡 <strong>Pro Tip:</strong> All models on Tafara.ai are completely free! We've hand-picked the best free AI models so you never have to worry about costs.</p>
              </div>
            </div>
          </Section>

          <Section title="Building Your AI">
            <div className="space-y-4 text-gray-300">
              <Step 
                title="Name Your AI"
                description="Give it a friendly name like 'Study Buddy' or 'Writing Assistant'"
              />
              <Step 
                title="Set the Personality"
                description="Describe how you want your AI to behave: friendly, professional, encouraging, etc."
              />
              <Step 
                title="Write Instructions"
                description="Tell your AI what its job is in plain English. For example: 'Help me practice Spanish by having conversations and correcting my grammar.'"
              />
              <Step 
                title="Choose a Model"
                description="Different models have different strengths:"
              />
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li><strong className="text-tafara-cyan">Aurora Alpha:</strong> Great all-around performance</li>
                <li><strong className="text-tafara-cyan">Step 3.5 Flash:</strong> Lightning fast responses</li>
                <li><strong className="text-tafara-cyan">Trinity Large:</strong> Powerful for complex tasks</li>
                <li><strong className="text-tafara-cyan">LFM 2.5 Thinking:</strong> Advanced reasoning capabilities</li>
                <li><strong className="text-tafara-cyan">Nemotron Models:</strong> NVIDIA's cutting-edge AI</li>
                <li><strong className="text-tafara-cyan">Qwen3 VL:</strong> Excellent for visual understanding</li>
              </ul>
            </div>
          </Section>

          <Section title="Privacy & Data">
            <div className="space-y-4 text-gray-300">
              <p>Tafara.ai is built with privacy first:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All your AI configurations are stored locally on YOUR device</li>
                <li>We don't have servers collecting your data</li>
                <li>Your conversations go directly to the AI provider (OpenRouter)</li>
                <li>We never see or store your API keys or conversations</li>
              </ul>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-200">⚠️ <strong>Note:</strong> If you clear your browser data, your saved AI configurations will be deleted. Make sure to note down important configurations!</p>
              </div>
            </div>
          </Section>

          <Section title="Example Use Cases">
            <div className="grid md:grid-cols-2 gap-4">
              <UseCase 
                title="Study Assistant"
                description="Quiz me on biology, explain concepts I don't understand, and help me prepare for exams."
              />
              <UseCase 
                title="Writing Coach"
                description="Help me brainstorm ideas, improve my writing style, and check my grammar."
              />
              <UseCase 
                title="Language Tutor"
                description="Practice conversations in Spanish, correct my mistakes, and teach me new vocabulary."
              />
              <UseCase 
                title="Creative Partner"
                description="Help me write stories, develop characters, and overcome writer's block."
              />
              <UseCase 
                title="Coding Helper"
                description="Explain programming concepts, debug my code, and suggest improvements."
              />
              <UseCase 
                title="Life Coach"
                description="Help me set goals, stay motivated, and develop better habits."
              />
            </div>
          </Section>

          <Section title="Tips for Best Results">
            <ul className="list-disc list-inside text-gray-300 space-y-3 ml-4">
              <li><strong className="text-tafara-cyan">Be specific:</strong> The more detailed your instructions, the better your AI will perform</li>
              <li><strong className="text-tafara-cyan">Test and refine:</strong> Try chatting with your AI and adjust the configuration if needed</li>
              <li><strong className="text-tafara-cyan">Save configurations:</strong> Create different AIs for different tasks</li>
              <li><strong className="text-tafara-cyan">Experiment with models:</strong> Different models work better for different tasks</li>
            </ul>
          </Section>

          <div className="bg-gradient-to-r from-tafara-teal/20 to-tafara-cyan/20 border border-tafara-teal/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-tafara-cyan mb-4">Ready to Build?</h2>
            <p className="text-gray-300 mb-6">Start creating your custom AI assistant now!</p>
            <Link 
              href="/builder"
              className="inline-block px-8 py-4 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-lg text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50 transform hover:scale-105 transition-all duration-300"
            >
              Go to Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      {children}
    </div>
  )
}

function Step({ title, description }: { title: string, description: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-tafara-cyan mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

function UseCase({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-tafara-dark/50 border border-tafara-teal/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-tafara-cyan mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  )
}
