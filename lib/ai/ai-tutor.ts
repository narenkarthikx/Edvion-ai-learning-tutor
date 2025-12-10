import { GoogleGenerativeAI } from '@google/generative-ai'

class AITutor {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async generatePersonalizedLesson(studentProfile: any, topic: string) {
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
    Create a personalized lesson for:
    - Student Grade: ${studentProfile.grade}
    - Learning Style: ${studentProfile.learningStyle}
    - Language: ${studentProfile.language}
    - Topic: ${topic}
    - Current Gaps: ${studentProfile.learningGaps?.join(', ')}
    
    Generate a lesson with:
    1. Simple explanation suitable for grade ${studentProfile.grade}
    2. Interactive examples
    3. Practice questions (3-5)
    4. Visual descriptions for ${studentProfile.learningStyle} learner
    5. Content in ${studentProfile.language} language context
    
    Format as JSON with: title, explanation, examples, questions, visuals
    `

    const result = await model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }

  async provideTutoringHelp(question: string, studentContext: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
    
    const prompt = `
    Student (Grade ${studentContext.grade}) asks: "${question}"
    
    Provide a helpful, age-appropriate explanation that:
    1. Acknowledges their question
    2. Explains step-by-step in simple terms
    3. Gives a relatable example
    4. Encourages them to keep learning
    5. Suggests a follow-up practice activity
    
    Keep response under 150 words, friendly tone.
    `

    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  async generateAdaptiveAssessment(studentProfile: any, subject: string) {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
    
    const prompt = `
    Generate an adaptive assessment for:
    - Grade: ${studentProfile.grade}
    - Subject: ${subject}
    - Difficulty Level: ${studentProfile.difficulty}
    - Recent Performance: ${studentProfile.averageScore}%
    
    Create 5 questions that:
    1. Test current understanding
    2. Identify potential gaps
    3. Are engaging and age-appropriate
    4. Include multiple choice and open-ended
    5. Have clear success criteria
    
    Return as JSON with questions, options, correct answers, and explanations.
    `

    const result = await model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }
}

export default AITutor
