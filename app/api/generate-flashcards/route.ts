import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { subject, grade, chapter, chapterTitle, count = 10 } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const prompt = `
Create ${count} smart flashcards for Tamil Nadu Class ${grade} students.

Subject: ${subject}
Chapter ${chapter}: ${chapterTitle}

CRITICAL: Return ONLY valid JSON array. No markdown, no code blocks, no extra text.

[
  {
    "question": "Clear, specific question testing one concept",
    "answer": "Complete answer with explanation and examples",
    "hint": "Helpful hint that guides thinking",
    "difficulty": "easy",
    "topic": "Specific sub-topic from the chapter"
  }
]

FLASHCARD REQUIREMENTS:
1. Questions must be clear and test ONE concept at a time
2. Cover key concepts from "${chapterTitle}" chapter
3. Mix difficulties: ${Math.floor(count * 0.4)} easy, ${Math.floor(count * 0.4)} medium, ${Math.ceil(count * 0.2)} hard
4. Answers should explain the concept, not just state facts
5. Hints should guide thinking without revealing the answer
6. Use Tamil Nadu context and TNSCERT curriculum
7. Questions should prompt recall and understanding, not just yes/no

DIFFICULTY LEVELS:
- easy: Direct recall of key facts/definitions from ${chapterTitle}
- medium: Application of concepts from ${chapterTitle} to simple problems
- hard: Analysis, synthesis, or connecting multiple concepts from ${chapterTitle}

Return ONLY the JSON array. Start directly with [
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim()
    const jsonCodeBlockRegex = /^```json\s*([\s\S]*?)\s*```$/
    const codeBlockRegex = /^```\s*([\s\S]*?)\s*```$/
    
    if (jsonCodeBlockRegex.test(jsonText)) {
      const match = jsonText.match(jsonCodeBlockRegex)
      jsonText = match ? match[1].trim() : jsonText
    } else if (codeBlockRegex.test(jsonText)) {
      const match = jsonText.match(codeBlockRegex)
      jsonText = match ? match[1].trim() : jsonText
    }

    const flashcards = JSON.parse(jsonText)

    return NextResponse.json({ 
      flashcards,
      metadata: {
        subject,
        grade,
        chapter,
        chapterTitle,
        generated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
}
