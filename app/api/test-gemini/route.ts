import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
  try {
    console.log('Testing Gemini API connection...')
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY)
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length)
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "No API key found",
        envKeys: Object.keys(process.env).filter(key => key.includes('GEMINI'))
      })
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

    const prompt = "Say hello in one sentence."

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('Gemini API Response:', response)

    return NextResponse.json({ 
      success: true,
      message: "Gemini API is working!",
      response: response,
      apiKeyPresent: true
    })

  } catch (error) {
    console.error('Gemini API Test Error:', error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorType = error instanceof Error ? error.constructor.name : "Unknown"
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      errorType: errorType,
      apiKeyPresent: !!process.env.GEMINI_API_KEY
    })
  }
}