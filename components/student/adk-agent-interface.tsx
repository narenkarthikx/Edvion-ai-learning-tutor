'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Sparkles, 
  Target, 
  Trophy, 
  MessageSquare, 
  HelpCircle,
  BookOpen,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface ADKAgentProps {
  grade: number
  subject?: string
  context?: any
}

export function ADKAgentInterface({ grade, subject, context = {} }: ADKAgentProps) {
  const [query, setQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const agents = [
    {
      id: 'content-generator',
      name: 'Content Generator',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      description: 'Create personalized lessons',
      examples: ['Teach me about Quadratic Equations', 'Explain Photosynthesis']
    },
    {
      id: 'gap-analyzer',
      name: 'Gap Analyzer',
      icon: Target,
      color: 'from-red-500 to-orange-500',
      description: 'Find learning gaps',
      examples: ['Analyze my math gaps', 'What concepts am I missing?']
    },
    {
      id: 'assessor',
      name: 'Assessment Creator',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      description: 'Generate practice tests',
      examples: ['Create a test on Electricity', 'Quiz me on Trigonometry']
    },
    {
      id: 'motivator',
      name: 'Motivator',
      icon: Sparkles,
      color: 'from-pink-500 to-purple-500',
      description: 'Stay motivated',
      examples: ['I need motivation to study', 'Daily challenge for Math']
    },
    {
      id: 'tutor',
      name: 'Personal Tutor',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      description: '1-on-1 tutoring help',
      examples: ['How do I solve this equation?', 'Explain Newton\'s Laws']
    },
    {
      id: null,
      name: 'Smart Router',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      description: 'Auto-detect best agent',
      examples: ['Ask anything!', 'Let AI choose the right expert']
    }
  ]

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/adk-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          agentType: selectedAgent,
          context: {
            grade,
            subject,
            ...context
          }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }

      setResponse(data)
    } catch (err: any) {
      setError(err.message || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely render content
  const renderContent = (content: any): React.ReactNode => {
    if (!content) return null
    if (typeof content === 'string') return content
    if (typeof content === 'number' || typeof content === 'boolean') return String(content)
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {content.map((item, idx) => (
            <li key={idx}>{renderContent(item)}</li>
          ))}
        </ul>
      )
    }
    if (typeof content === 'object') {
      return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>
    }
    return null
  }

  const renderResponse = () => {
    if (!response) return null

    const result = response.result

    // Content Generator Response
    if (response.agentUsed === 'content-generator' && result.concepts) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">Personalized Lesson Created!</h3>
          </div>

          {result.introduction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{renderContent(result.introduction)}</div>
              </CardContent>
            </Card>
          )}

          {result.concepts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Core Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{renderContent(result.concepts)}</div>
              </CardContent>
            </Card>
          )}

          {result.activities && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Practice Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{renderContent(result.activities)}</div>
              </CardContent>
            </Card>
          )}

          {result.quiz && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{renderContent(result.quiz)}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    // Gap Analyzer Response
    if (response.agentUsed === 'gap-analyzer') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-lg">Gap Analysis Complete</h3>
          </div>

          {result.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap">{renderContent(result.analysis)}</div>
              </CardContent>
            </Card>
          )}

          {result.gapsIdentified && result.gapsIdentified.length > 0 && !result.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gaps Identified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.gapsIdentified.map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 border rounded-lg">
                      <Badge variant={
                        gap.severity === 'critical' ? 'destructive' :
                        gap.severity === 'high' ? 'default' :
                        'secondary'
                      }>
                        {gap.severity}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{renderContent(gap.topic)}</p>
                        <p className="text-xs text-muted-foreground">{renderContent(gap.gap)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.remediationPlan && !result.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Remediation Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  {result.remediationPlan.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>{renderContent(step)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    // Assessment Response
    if (response.agentUsed === 'assessor' && result.questions) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-lg">Assessment Created</h3>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {result.questions.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge>{idx + 1}</Badge>
                      <p className="font-medium text-sm flex-1">{q.question}</p>
                    </div>
                    {q.options && (
                      <div className="ml-8 space-y-1 text-sm text-muted-foreground">
                        {q.options.map((opt: string, oidx: number) => (
                          <div key={oidx}>{String.fromCharCode(65 + oidx)}. {opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Motivator Response
    if (response.agentUsed === 'motivator' && result.message) {
      return (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Motivational Message {result.emoji || '✨'}</h3>
              </div>
              <div className="text-sm whitespace-pre-wrap">{renderContent(result.message)}</div>
              
              {result.actionItems && result.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Action Items:</h4>
                  <ul className="space-y-1 text-sm">
                    {result.actionItems.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <span>{renderContent(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Tutor Response
    if (response.agentUsed === 'tutor' && result.response) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Tutor Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap mb-4">{renderContent(result.response)}</div>
              
              {result.practiceExercise && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mt-3">
                  <h4 className="font-medium text-sm mb-1">Practice Exercise:</h4>
                  <div className="text-sm">{renderContent(result.practiceExercise)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Think About These:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {result.followUpQuestions.map((q: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>{renderContent(q)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    // Generic Response - safely render any response structure
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm">{renderContent(result)}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            ADK Agent System
          </CardTitle>
          <CardDescription>
            Multi-Agent AI System for Personalized Learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agents">Select Agent</TabsTrigger>
              <TabsTrigger value="query">Ask Question</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agents" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose an AI agent to help you, or let our Smart Router pick the best one!
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id || 'auto'}
                    className={`cursor-pointer transition-all ${
                      selectedAgent === agent.id
                        ? 'border-primary shadow-md'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center flex-shrink-0`}>
                          <agent.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
                          <div className="text-xs text-muted-foreground italic">
                            {agent.examples[0]}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="query" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Question or Request</label>
                <Textarea
                  placeholder="Ask anything... e.g., 'Teach me about Pythagoras theorem' or 'I need motivation to study math'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                {selectedAgent && (
                  <Badge variant="outline">
                    Using: {agents.find(a => a.id === selectedAgent)?.name || 'Smart Router'}
                  </Badge>
                )}
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading || !query.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Help
                  </>
                )}
              </Button>

              {error && (
                <Card className="border-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {response && (
        <Card className="max-h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Response</CardTitle>
              <Badge>
                Agent: {agents.find(a => a.id === response.agentUsed)?.name || response.agentUsed}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {renderResponse()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
