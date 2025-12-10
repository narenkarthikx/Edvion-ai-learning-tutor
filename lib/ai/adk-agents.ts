// Advanced Agent Development Kit (ADK) for Skill Gap Radar
// Multi-Agent System with specialized roles and inter-agent communication

import { GoogleGenerativeAI } from '@google/generative-ai'

// Base Agent Interface
export interface BaseAgent {
  id: string
  name: string
  role: string
  capabilities: string[]
  priority: number
  status: 'active' | 'idle' | 'processing'
}

// Agent Communication Protocol
export interface AgentMessage {
  from: string
  to: string
  type: 'request' | 'response' | 'notification'
  payload: any
  timestamp: number
}

// Agent Coordinator - Orchestrates multi-agent workflows
export class AgentCoordinator {
  private agents: Map<string, any>
  private messageQueue: AgentMessage[]
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.agents = new Map()
    this.messageQueue = []
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  registerAgent(id: string, agent: any) {
    this.agents.set(id, agent)
  }

  async routeRequest(request: string, context: any): Promise<any> {
    // Intelligent routing based on request type
    const intent = await this.detectIntent(request, context)
    
    switch (intent.type) {
      case 'learning_content':
        return await this.agents.get('content-generator')?.handle(request, context)
      case 'gap_analysis':
        return await this.agents.get('gap-analyzer')?.handle(request, context)
      case 'assessment':
        return await this.agents.get('assessor')?.handle(request, context)
      case 'motivation':
        return await this.agents.get('motivator')?.handle(request, context)
      case 'tutoring':
        return await this.agents.get('tutor')?.handle(request, context)
      default:
        return await this.agents.get('general-assistant')?.handle(request, context)
    }
  }

  private async detectIntent(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
      }
    })

    const prompt = `
Classify the following student request into one of these intents:
- learning_content: Student wants to learn something new
- gap_analysis: Identify what student doesn't understand
- assessment: Student wants to take a test or be evaluated
- motivation: Student needs encouragement or motivation
- tutoring: Student has a specific question or needs help

Student Request: "${request}"
Context: Grade ${context.grade}, Subject: ${context.subject || 'any'}

Return ONLY a JSON object: { "type": "<intent>", "confidence": <0-1>, "subjectArea": "<subject>" }
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Parse JSON response
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim()
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }
    
    return JSON.parse(jsonText)
  }
}

// 1. CONTENT GENERATOR AGENT - Creates personalized learning content
export class ContentGeneratorAgent {
  private genAI: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async handle(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `
You are a Tamil Nadu curriculum expert creating personalized learning content for Class ${context.grade} students.

Student Request: ${request}
Subject: ${context.subject || 'General'}
Grade: Class ${context.grade}

Create an engaging, comprehensive lesson with the following sections. Write naturally and conversationally, as if teaching a student directly:

**INTRODUCTION:**
[Write a friendly, engaging 2-3 sentence introduction that hooks the student's interest]

**CORE CONCEPTS:**
[Explain the main concepts clearly with examples from daily life. Use simple language appropriate for Class ${context.grade}. Break down complex ideas into easy steps.]

**PRACTICE ACTIVITIES:**
[Provide 3-4 hands-on activities or practice problems the student can try right now]

**REAL-WORLD APPLICATIONS:**
[Show how this connects to real life in Tamil Nadu - use local examples like markets, festivals, farming, etc.]

**QUICK QUIZ:**
[Ask 2-3 quick questions to check understanding]

**NEXT STEPS:**
[Suggest what the student should learn next to build on this topic]

Write everything clearly and naturally. Do NOT use JSON format. Write as plain text with clear section headers.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Parse sections from the text response
    const sections: any = {
      introduction: '',
      concepts: '',
      activities: '',
      applications: '',
      quiz: '',
      nextSteps: ''
    }
    
    const sectionRegex = /\*\*([A-Z\s]+):\*\*\s*([\s\S]*?)(?=\*\*[A-Z\s]+:\*\*|$)/g
    let match
    
    while ((match = sectionRegex.exec(response)) !== null) {
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '')
      const content = match[2].trim()
      
      if (sectionName.includes('introduction')) sections.introduction = content
      else if (sectionName.includes('concept')) sections.concepts = content
      else if (sectionName.includes('practice') || sectionName.includes('activit')) sections.activities = content
      else if (sectionName.includes('real') || sectionName.includes('application')) sections.applications = content
      else if (sectionName.includes('quiz')) sections.quiz = content
      else if (sectionName.includes('next')) sections.nextSteps = content
    }
    
    // If parsing failed, return the whole response as concepts
    if (!sections.concepts && !sections.introduction) {
      sections.concepts = response
    }
    
    return sections
  }
}

// 2. GAP ANALYZER AGENT - Identifies learning gaps with precision
export class GapAnalyzerAgent {
  private genAI: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async handle(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `
You are analyzing learning gaps for a Class ${context.grade} Tamil Nadu student.

Topic/Question: ${request}
Current Grade: Class ${context.grade}

Analyze what gaps might exist and provide a helpful, encouraging response in this format:

**GAPS IDENTIFIED:**
List 2-3 specific areas where the student might be struggling. For each gap, mention:
- What concept they're missing
- Why it's important
- How severe it is (critical/high/medium/low)

**ROOT CAUSE:**
Explain in 1-2 sentences what the underlying issue might be.

**WHAT TO LEARN FIRST:**
List the prerequisite topics they should understand before tackling this.

**STEP-BY-STEP RECOVERY PLAN:**
Give 4-5 clear, actionable steps to close these gaps, starting from basics.

**ESTIMATED TIME:**
How long will this take to master?

Be encouraging and specific. Write naturally, don't use JSON format.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Return structured but readable format
    return {
      gapsIdentified: [{
        gap: 'Analysis complete',
        severity: 'medium',
        topic: request
      }],
      analysis: response,
      remediationPlan: {
        steps: ['See detailed plan above'],
        estimatedTime: 'Check the response',
        resources: []
      }
    }
  }

  async analyzeConceptDependencies(topic: string, grade: number) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `
For Tamil Nadu Class ${grade} curriculum, map the concept dependencies for: "${topic}"

Create a dependency tree showing:
1. Prerequisites (what must be learned first)
2. Core concept breakdown
3. Advanced concepts that build on this
4. Related topics in other subjects

Return as JSON: {
  "prerequisites": [{ "concept": "", "importance": "essential|recommended|optional" }],
  "coreComponents": [],
  "advancedTopics": [],
  "crossSubjectLinks": []
}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim()
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }
    
    return JSON.parse(jsonText)
  }
}

// 3. ASSESSMENT AGENT - Creates adaptive assessments
export class AssessmentAgent {
  private genAI: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async handle(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.6,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `
Create an adaptive assessment for Class ${context.grade} Tamil Nadu student.

Subject: ${context.subject}
Topic: ${request}
Current Difficulty: ${context.difficulty || 'intermediate'}
Board Exam Pattern: ${context.examType || 'TNSCERT'}
Time Available: ${context.timeLimit || '30'} minutes

Generate assessment with:
1. **Warm-up Questions** (2) - Easy confidence builders
2. **Core Questions** (5-7) - Match student level
3. **Challenge Questions** (2-3) - Slightly harder
4. **Bonus Question** (1) - Optional advanced

For each question include:
- Question text
- Options (if MCQ)
- Correct answer
- Explanation
- Marks allocation
- Skills tested
- Board exam relevance

Mix question types:
- 40% MCQ
- 30% Short Answer
- 20% Problem Solving
- 10% Application/Analysis

Return as JSON with questions array and metadata.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim()
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }
    
    return JSON.parse(jsonText)
  }

  async evaluateAnswer(question: string, studentAnswer: string, correctAnswer: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `
Evaluate student answer:

Question: ${question}
Student Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}
Grade Level: ${context.grade}

Provide detailed evaluation:
1. **Correctness** (0-100%)
2. **Partial Credit** - What they got right
3. **Mistakes** - Specific errors made
4. **Feedback** - Constructive, encouraging
5. **Improvement Tips** - How to do better next time

Return as JSON: {
  "score": 0-100,
  "isCorrect": boolean,
  "partialCredit": [],
  "mistakes": [],
  "feedback": "",
  "improvementTips": [],
  "nextPractice": ""
}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim()
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }
    
    return JSON.parse(jsonText)
  }
}

// 4. MOTIVATOR AGENT - Keeps students engaged and motivated
export class MotivatorAgent {
  private genAI: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async handle(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `
You are a warm, caring mentor for a Class ${context.grade} student in Tamil Nadu.

Student says: "${request}"

Write an encouraging, motivational message that:
- Shows you understand how they feel
- Celebrates their effort and progress
- Gives them confidence to keep going
- Suggests 2-3 small, achievable next steps
- Uses simple, friendly language

Keep it warm, personal, and around 3-4 paragraphs. Be genuinely encouraging! 

Add relevant emojis to make it friendly. Write naturally, don't use JSON format.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    return {
      message: responseText,
      actionItems: ['See the suggestions in the message above'],
      inspirationStory: '',
      celebrationNote: '',
      emoji: '✨'
    }
  }

  async generateDailyChallenge(grade: number, subject: string) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `
Create a fun daily challenge for Class ${grade} ${subject} students.

Requirements:
- Takes 5-10 minutes
- Interesting/fun element
- Educational value
- Can be done anywhere
- Shows results immediately

Return as JSON: {
  "title": "",
  "description": "",
  "task": "",
  "estimatedTime": "",
  "points": 0-100,
  "funFact": "",
  "shareableResult": ""
}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim()
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim()
    }
    
    return JSON.parse(jsonText)
  }
}

// 5. TUTOR AGENT - Interactive 1-on-1 tutoring
export class TutorAgent {
  private genAI: GoogleGenerativeAI
  private conversationHistory: Array<{ role: string; content: string }>
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.conversationHistory = []
  }

  async handle(request: string, context: any) {
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: request })

    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })

    const conversationContext = this.conversationHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const prompt = `
You are a friendly, expert tutor helping a Class ${context.grade} Tamil Nadu student.

Previous conversation:
${conversationContext}

Student asks: "${request}"

Respond naturally as a helpful tutor would:

**YOUR EXPLANATION:**
[Explain the concept clearly in 2-3 paragraphs. Use simple language and everyday examples from Tamil Nadu. Make it friendly and encouraging.]

**TRY THIS:**
[Give 1-2 simple practice problems or activities they can try right now]

**THINK ABOUT:**
[Ask 1-2 questions to help them think deeper about this topic]

Write naturally and conversationally. Be warm and encouraging. Don't use JSON format.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Add to history
    this.conversationHistory.push({ role: 'tutor', content: responseText })
    
    return {
      response: responseText,
      keyPoints: [],
      practiceExercise: 'See "Try This" section above',
      followUpQuestions: [],
      resources: []
    }
  }

  resetConversation() {
    this.conversationHistory = []
  }

  getConversationSummary() {
    return {
      messages: this.conversationHistory.length,
      topics: this.extractTopics(),
      duration: 'active'
    }
  }

  private extractTopics(): string[] {
    // Simple topic extraction (can be enhanced)
    return ['conversation_topic']
  }
}

// 6. GENERAL ASSISTANT AGENT - Handles miscellaneous queries
export class GeneralAssistantAgent {
  private genAI: GoogleGenerativeAI
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async handle(request: string, context: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `
Help a Class ${context.grade} Tamil Nadu student with their query.

Query: ${request}

Provide helpful, age-appropriate response that:
1. Directly answers their question
2. Keeps it relevant to their education
3. Encourages learning
4. Suggests related topics if applicable

Keep response friendly and under 150 words.
`

    const result = await model.generateContent(prompt)
    return {
      response: result.response.text(),
      type: 'general_help'
    }
  }
}

// Export factory function to initialize the ADK system
export async function initializeADKSystem(apiKey: string) {
  const coordinator = new AgentCoordinator(apiKey)
  
  // Register all agents
  coordinator.registerAgent('content-generator', new ContentGeneratorAgent(apiKey))
  coordinator.registerAgent('gap-analyzer', new GapAnalyzerAgent(apiKey))
  coordinator.registerAgent('assessor', new AssessmentAgent(apiKey))
  coordinator.registerAgent('motivator', new MotivatorAgent(apiKey))
  coordinator.registerAgent('tutor', new TutorAgent(apiKey))
  coordinator.registerAgent('general-assistant', new GeneralAssistantAgent(apiKey))
  
  return coordinator
}
