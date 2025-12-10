import { NextRequest, NextResponse } from 'next/server'
import { initializeADKSystem } from '@/lib/ai/adk-agents'

export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      agentType, 
      context 
    } = await request.json()

    console.log('ADK Agent Request:', { query, agentType, context })

    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Validate query
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Initialize ADK system
    const coordinator = await initializeADKSystem(process.env.GEMINI_API_KEY)

    let result

    // Route to specific agent or use intelligent routing
    if (agentType) {
      const agent = (coordinator as any).agents.get(agentType)
      if (!agent) {
        console.error(`Agent not found: ${agentType}`)
        return NextResponse.json(
          { error: `Agent ${agentType} not found. Available agents: content-generator, gap-analyzer, assessor, motivator, tutor, general-assistant` },
          { status: 404 }
        )
      }
      console.log(`Using agent: ${agentType}`)
      result = await agent.handle(query, context)
    } else {
      // Use intelligent routing
      console.log('Using auto-routing')
      result = await coordinator.routeRequest(query, context)
    }

    console.log('ADK Agent Result:', result)

    return NextResponse.json({ 
      success: true,
      result,
      agentUsed: agentType || 'auto-routed',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('ADK Agent error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: error.message || 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}

// Endpoint to get agent info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const info = searchParams.get('info')

  if (info === 'agents') {
    return NextResponse.json({
      agents: [
        {
          id: 'content-generator',
          name: 'Content Generator Agent',
          description: 'Creates personalized learning content',
          capabilities: ['lesson generation', 'visual aids', 'practice activities']
        },
        {
          id: 'gap-analyzer',
          name: 'Gap Analyzer Agent',
          description: 'Identifies learning gaps and creates remediation plans',
          capabilities: ['gap detection', 'prerequisite analysis', 'remediation planning']
        },
        {
          id: 'assessor',
          name: 'Assessment Agent',
          description: 'Creates adaptive assessments and evaluates answers',
          capabilities: ['test generation', 'answer evaluation', 'board exam patterns']
        },
        {
          id: 'motivator',
          name: 'Motivator Agent',
          description: 'Keeps students engaged and motivated',
          capabilities: ['motivation', 'daily challenges', 'encouragement']
        },
        {
          id: 'tutor',
          name: 'Tutor Agent',
          description: 'Interactive 1-on-1 tutoring with conversation memory',
          capabilities: ['tutoring', 'socratic questioning', 'concept explanation']
        },
        {
          id: 'general-assistant',
          name: 'General Assistant Agent',
          description: 'Handles miscellaneous queries',
          capabilities: ['general help', 'information', 'guidance']
        }
      ]
    })
  }

  return NextResponse.json({
    message: 'ADK Agent System',
    version: '1.0.0',
    endpoints: {
      post: '/api/adk-agent - Process agent request',
      get: '/api/adk-agent?info=agents - Get agent information'
    }
  })
}
