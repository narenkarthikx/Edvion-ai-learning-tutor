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
You are a Tamil Nadu curriculum expert creating content for Class ${context.grade} students.

Student Request: ${request}
Subject: ${context.subject || 'General'}
Learning Style: ${context.learningStyle || 'visual'}
Language Preference: ${context.language || 'English'}
Current Understanding Level: ${context.difficulty || 'intermediate'}

Generate comprehensive learning content with:
1. **Introduction** - Friendly, engaging opening
2. **Core Concepts** - Clear explanations with examples
3. **Visual Aids** - Descriptions for diagrams/illustrations
4. **Practice Activities** - 3-5 interactive exercises
5. **Real-World Applications** - Tamil Nadu context examples
6. **Quick Quiz** - 3 questions to check understanding
7. **Next Steps** - What to learn next

Format as JSON with sections: introduction, concepts, visualAids, activities, applications, quiz, nextSteps
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
Analyze learning gaps for a Class ${context.grade} Tamil Nadu student.

Recent Performance Data:
${JSON.stringify(context.recentScores || {}, null, 2)}

Recent Mistakes:
${JSON.stringify(context.recentMistakes || [], null, 2)}

Current Topic: ${context.currentTopic || request}

Perform deep gap analysis:
1. **Fundamental Gaps** - Missing basic concepts
2. **Prerequisite Knowledge** - What they should have learned before
3. **Current Topic Gaps** - Specific misunderstandings
4. **Practice Gaps** - Areas needing more practice
5. **Recommended Remediation** - Step-by-step recovery plan

Return as JSON: { 
  "gapsIdentified": [{ "gap": "", "severity": "critical|high|medium|low", "topic": "" }],
  "rootCause": "",
  "prerequisites": [],
  "remediationPlan": { "steps": [], "estimatedTime": "", "resources": [] },
  "confidenceScore": 0-100
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
You are a caring mentor for a Class ${context.grade} student in Tamil Nadu.

Student Situation: ${request}
Recent Performance: ${context.recentScores?.average || 'N/A'}%
Mood Indicators: ${context.mood || 'neutral'}
Learning Streak: ${context.streak || 0} days

Provide motivational response with:
1. **Empathy** - Understand their feelings
2. **Encouragement** - Specific praise for effort
3. **Perspective** - Reframe challenges positively
4. **Action Plan** - Small achievable next steps
5. **Inspiration** - Relevant success story (Tamil context)
6. **Affirmation** - Belief in their potential

Tone: Warm, friendly, age-appropriate for Class ${context.grade}
Length: 2-3 paragraphs

Return as JSON: {
  "message": "",
  "actionItems": [],
  "inspirationStory": "",
  "celebrationNote": "",
  "emoji": ""
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
You are an expert tutor for Class ${context.grade} Tamil Nadu students.

Previous Conversation:
${conversationContext}

Student's Current Question: ${request}
Subject: ${context.subject || 'General'}
Student's Level: ${context.difficulty || 'intermediate'}

Respond as an excellent tutor would:
1. **Acknowledge** - Show you understood the question
2. **Check Prerequisites** - Ensure they have basic knowledge
3. **Explain Simply** - Use analogies and examples
4. **Visual Description** - Help them visualize concepts
5. **Practice Opportunity** - Give them something to try
6. **Socratic Questions** - Ask questions to deepen understanding

Keep response:
- Conversational and friendly
- Grade-appropriate language
- 3-4 paragraphs maximum
- Include 1-2 follow-up questions

Return as JSON: {
  "response": "",
  "keyPoints": [],
  "practiceExercise": "",
  "followUpQuestions": [],
  "resources": []
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
    
    const tutorResponse = JSON.parse(jsonText)
    
    // Add tutor response to history
    this.conversationHistory.push({ role: 'tutor', content: tutorResponse.response })
    
    return tutorResponse
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
