import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { getCurriculumScope, getHighPriorityTopics, EXAM_KEYWORDS } from '@/lib/curriculum/class10-curriculum'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  let requestData = { question: "", grade: 10, subjects: [] }
  
  try {
    requestData = await request.json()
    const { question, grade, subjects } = requestData

    console.log('AI Tutor Request:', { question, grade, subjects })
    console.log('Environment API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing')

    // Enhanced validation and better error messages
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY - using enhanced fallback')
      const enhancedFallback = getEnhancedFallbackResponse(question, grade, subjects)
      return NextResponse.json({ response: enhancedFallback })
    }

    // Validate that we have a question
    if (!question || question.trim() === '') {
      return NextResponse.json({ 
        response: `Hi! I didn't receive your question. Please ask me something about your Grade ${grade} studies! 😊` 
      })
    }

    // Get curriculum data for enhanced responses based on grade
    let curriculumTopics = ''
    let gradeSpecificPrompt = ''
    
    if (grade === 10) {
      const mathCurriculum = getCurriculumScope('mathematics');
      const scienceCurriculum = getCurriculumScope('science');
      const highPriorityMathTopics = getHighPriorityTopics('mathematics').map(t => `Ch${t.chapter}: ${t.title}`).slice(0, 3);
      const highPriorityScienceTopics = getHighPriorityTopics('science').map(t => `Ch${t.chapter}: ${t.title}`).slice(0, 3);
      curriculumTopics = `MATHEMATICS: ${highPriorityMathTopics.join(', ')}\nSCIENCE: ${highPriorityScienceTopics.join(', ')}`
      gradeSpecificPrompt = 'You are TamilNadu10thAI - specialized for Tamil Nadu Class 10 TNSCERT curriculum and board exam preparation with strong foundational focus.'
    } else if (grade === 7) {
      curriculumTopics = `MATHEMATICS: Integers, Fractions, Simple Equations, Lines and Angles\nSCIENCE: Nutrition in Plants, Animal Nutrition, Heat, Motion and Time`
      gradeSpecificPrompt = 'You are TamilNadu7thAI - specialized for Tamil Nadu Class 7 TNSCERT curriculum helping students build strong foundations in government schools.'
    } else {
      curriculumTopics = 'General topics for the specified grade'
      gradeSpecificPrompt = `You are TamilNaduAI - specialized for Tamil Nadu Class ${grade} TNSCERT curriculum with foundational learning approach.`
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const prompt = `
You are an expert AI tutor for Tamil Nadu Class ${grade} students using the TNSCERT curriculum.

STUDENT'S QUESTION: "${question}"

Grade: ${grade}
Subjects: ${subjects.join(', ')}
Key Topics for Class ${grade}: ${curriculumTopics}

CRITICAL INSTRUCTION: You MUST directly answer the student's specific question above. Do NOT provide generic responses or unrelated content.

YOUR RESPONSE MUST:

YOUR RESPONSE MUST:
1. **DIRECTLY ADDRESS** the student's specific question
2. **STAY ON TOPIC** - only discuss what they asked about
3. **BE SPECIFIC** - provide actual examples, formulas, or explanations related to their question
4. **USE SIMPLE LANGUAGE** appropriate for Class ${grade}
5. **BE BRIEF** - 3-4 paragraphs maximum (150-200 words)
6. **INCLUDE EXAMPLES** from daily life or Tamil Nadu context when relevant

TEACHING APPROACH:
- Start by directly answering what they asked
- Explain step-by-step if it's a how-to question
- Give specific examples related to their topic
- Use analogies from everyday life in Tamil Nadu
- End with a small follow-up question to check understanding

${grade === 10 ? 'BOARD EXAM FOCUS: Connect answer to Tamil Nadu board exam patterns when relevant' : 'FOUNDATION FOCUS: Build strong conceptual understanding'}

Format your response naturally - NO section headers, NO bullet points. Write like a friendly tutor explaining one-on-one.

Now answer the student's question: "${question}"
`

    console.log('Calling Gemini API with Grade:', grade)
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('AI Response generated successfully for Grade', grade, ':', response.substring(0, 100) + '...')
    return NextResponse.json({ response })

  } catch (error) {
    console.error('Gemini AI Error Details:', error)
    
    // Enhanced grade-aware fallback responses
    const enhancedFallback = getEnhancedFallbackResponse(requestData.question, requestData.grade, requestData.subjects)
    return NextResponse.json({ response: enhancedFallback })
  }
}

// Enhanced fallback function that handles different grades
function getEnhancedFallbackResponse(question: string, grade: number, subjects: string[]) {
  const questionLower = question?.toLowerCase() || ""
  
  // Grade-specific responses
  if (grade === 7) {
    return getGrade7FallbackResponse(questionLower, subjects)
  } else if (grade === 10) {
    return getGrade10FallbackResponse(questionLower, subjects)
  } else {
    return getGeneralFallbackResponse(questionLower, grade, subjects)
  }
}

function getGrade7FallbackResponse(question: string, subjects: string[]) {
  if (question.includes("math") || question.includes("integer") || question.includes("fraction") || question.includes("number")) {
    return `Building Math Foundations - Class 7

Let's strengthen your number foundations:
Integers - Understanding positive/negative numbers (like temperatures: +30°C hot, -5°C cold)
Fractions - Parts of a whole (like sharing 3/4 of a pizza among friends)
Simple Equations - Finding missing numbers (if 2 + ? = 7, then ? = 5)
Basic Geometry - Shapes and angles you see around you

Foundation tip: Master number sense first! Can you count backwards from 20? Do you know which is bigger: 3/4 or 2/3?

What specific number concept needs clarity? Let's build it step by step!`
  } else if (question.includes("science") || question.includes("plant") || question.includes("animal") || question.includes("food")) {
    return `Discovering Science Foundations - Class 7

Let's explore the world around us:
Plant Nutrition - How plants make food from sunlight (just like cooking!)
Animal Nutrition - What different animals eat and why
Heat & Temperature - Why we feel hot/cold, how heat moves
Motion - How things move fast or slow around us

Foundation tip: Science is everywhere! Look at a green leaf - it's actually a food factory!

Which part of nature interests you? Let's explore together!`
  } else if (question.includes("english") || question.includes("grammar") || question.includes("reading")) {
    return `Building English Foundations - Class 7

Let's strengthen your language skills:
Basic Grammar - Naming words (nouns), action words (verbs), describing words (adjectives)
Reading Skills - Understanding stories, finding main ideas
Speaking - Building confidence to express your thoughts
Writing - Simple, clear sentences and short paragraphs

Foundation tip: Start with simple sentences. "I eat rice" has subject (I), verb (eat), object (rice).

What language skill would you like to practice first?`
  } else {
    return `Welcome to Foundational Learning - Class 7!

Hi there! I'm here to help build your strong learning foundations. 

Remember: Every expert was once a beginner!

Choose what to strengthen:
Math Foundations - Numbers, basic operations, simple equations
Science Basics - Plants, animals, heat, motion  
English Skills - Reading, writing, speaking confidence
General Knowledge - History, geography around you

Ask me simple questions like: 
- "What are negative numbers?"
- "How do plants eat?"  
- "What is a noun?"

I'll explain everything step by step with examples you know! What shall we learn today?`
  }
}

function getGrade10FallbackResponse(question: string, subjects: string[]) {
  if (question.includes("math") || question.includes("algebra") || question.includes("equation") || question.includes("trigonometry")) {
    return `Building Strong Math Foundations for Boards - Class 10

Essential Foundation + Board Prep:
Quadratic Equations - Start with simple: x² = 4, then move to complex forms
Coordinate Geometry - Plot points first, then distance formulas  
Trigonometry - Master right triangles before advanced identities
Statistics - Understand averages before grouped data calculations

Foundation check: Can you solve linear equations confidently? That's the base for quadratic equations!

Board tip: Tamil Nadu board loves step-by-step solutions. Show every step clearly.

Which math foundation needs strengthening before we tackle board questions?`
  } else if (question.includes("science") || question.includes("physics") || question.includes("chemistry") || question.includes("biology")) {
    return `Science Foundations for Board Success - Class 10

Building concepts for boards:
Light & Optics - Master reflection before refraction (mirrors → lenses)
Electricity - Understand current flow before complex circuits
Acids & Bases - Know what acids/bases are before pH calculations
Life Processes - Understand basic body functions before complex systems

Foundation check: Do you understand what electric current actually is? That's key for all electricity chapters!

Board focus: Tamil Nadu exams test understanding, not just memorization.

Which science foundation needs clarity before board preparation?`
  } else if (question.includes("english") || question.includes("grammar") || question.includes("writing")) {
    return `English Foundations for Board Excellence - Class 10

Strong bases for board success:
Grammar Mastery - Perfect tenses before attempting passive voice
Reading Skills - Understand main ideas before literary analysis
Writing Foundation - Master paragraphs before essays
Board Patterns - Know question types and marking schemes

Foundation check: Can you identify subject and predicate in sentences? This helps with all grammar!

Board strategy: Tamil Nadu boards reward clear, structured answers.

Which English foundation should we strengthen for board confidence?`
  } else {
    return `Foundational Board Preparation - Class 10!

Building strong foundations for Tamil Nadu board success! 

Foundation-First Approach:
Math Foundations - Number systems → Advanced algebra → Geometry
Science Concepts - Basic principles → Applications → Problem solving
Language Skills - Grammar clarity → Reading → Writing mastery
Understanding - Concepts first → Applications → Exam techniques

Success Formula: Strong foundations + Board strategies = Excellent results!

Ask foundation questions like:
- "I don't understand quadratic equations basics"
- "What exactly is electric current?"
- "How do I write better answers?"

Which subject foundation needs strengthening first? I'll help you build it step by step!`
  }
}

function getGeneralFallbackResponse(question: string, grade: number, subjects: string[]) {
  return `TamilNadu${grade}thAI - Foundational Learning Support
  
I'm here to help build strong foundations for your Class ${grade} Tamil Nadu curriculum studies!

Your subjects: ${subjects.join(', ')}

Foundational Learning Approach:
- Start with basic concepts
- Build understanding step by step  
- Use everyday examples you know
- Practice until concepts are clear

Ask me questions about:
- Mathematics concepts and problems
- Science explanations and experiments  
- English grammar and literature
- Social studies topics
- Tamil language and literature

Try asking: "Help me understand [topic]" or "Explain [concept] for Class ${grade}"

What foundational concept would you like to strengthen today?`
}