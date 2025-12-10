import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  let subject = 'mathematics'
  let grade = 8
  let difficulty = 'intermediate'

  try {
    const requestData = await request.json()
    subject = requestData.subject || requestData.subjects?.[0] || 'mathematics'
    grade = requestData.grade || 8
    difficulty = requestData.difficulty || 'intermediate'

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "AI assessment generator not configured" 
      }, { status: 500 })
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
You are creating a smart adaptive assessment for Tamil Nadu Class ${grade} students studying ${subject}.

CRITICAL: Generate ONLY valid JSON in the exact format specified below. No markdown, no extra text.

{
  "questions": [
    {
      "id": 1,
      "question": "Clear question text based on TNSCERT syllabus",
      "type": "multiple_choice",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correct_answer": 0,
      "explanation": "Detailed explanation why this is correct with concept reference",
      "hint": "Helpful hint without giving answer away",
      "difficulty_level": "easy"
    }
  ]
}

REQUIREMENTS FOR CLASS ${grade} ${subject.toUpperCase()}:
1. Generate exactly 3 questions from TNSCERT Class ${grade} ${subject} curriculum
2. ${grade === 10 ? 'Mix difficulty: 1 easy (basic concept), 1 medium (application), 1 hard (analysis/synthesis) - Board exam style' : 'Foundation level questions: 2 easy, 1 medium - Build strong basics'}
3. Each question must have exactly 4 options labeled A), B), C), D)
4. correct_answer must be a number: 0 for A, 1 for B, 2 for C, 3 for D
5. Explanation must reference specific TNSCERT chapter/concept
6. Questions must test understanding, not just memorization
7. Use Tamil Nadu context in examples when possible

${grade === 10 ? 'Board Exam Focus: Follow Tamil Nadu board exam patterns and marking schemes' : 'Foundation Focus: Clear, simple language. Build confidence.'}

Return ONLY the JSON object. No code blocks, no markdown, no extra text.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    console.log('Generated AI Response:', responseText)
    
    // Clean and extract JSON from the response
    let jsonText = responseText.trim()
    
    // Remove code blocks if present
    const jsonCodeBlockRegex = /^```json\s*([\s\S]*?)\s*```$/
    const codeBlockRegex = /^```\s*([\s\S]*?)\s*```$/
    
    if (jsonCodeBlockRegex.test(jsonText)) {
      const match = jsonText.match(jsonCodeBlockRegex)
      jsonText = match ? match[1].trim() : jsonText
    } else if (codeBlockRegex.test(jsonText)) {
      const match = jsonText.match(codeBlockRegex)
      jsonText = match ? match[1].trim() : jsonText
    }
    
    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const questionsData = JSON.parse(jsonMatch[0])
      console.log('Parsed Questions:', questionsData)
      return NextResponse.json(questionsData)
    } else {
      console.log('Failed to extract JSON, using fallback')
      throw new Error("Failed to parse AI response")
    }

  } catch (error) {
    console.error('Assessment Generation Error:', error)
    
    // Fallback questions for specified grade
    const fallbackQuestions = {
      questions: getGradeSpecificQuestions(subject, grade)
    }
    
    return NextResponse.json(fallbackQuestions)
  }
}

function getGradeSpecificQuestions(subject: string, grade: number) {
  if (grade === 7) {
    return getGrade7Questions(subject)
  } else {
    return getGrade10Questions(subject)
  }
}

function getGrade7Questions(subject: string) {
  const questionBank = {
    mathematics: [
      {
        id: 1,
        question: "What is the result of (-5) + 3?",
        type: "multiple_choice",
        options: ["A) -8", "B) -2", "C) 2", "D) 8"],
        correct_answer: 1,
        explanation: "(-5) + 3 = -2. When adding integers with different signs, subtract and keep the sign of the larger number.",
        hint: "Think about movement on a number line. Start at -5 and move 3 steps to the right.",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "Which fraction is equivalent to 0.75?",
        type: "multiple_choice",
        options: ["A) 2/3", "B) 3/4", "C) 4/5", "D) 1/2"],
        correct_answer: 1,
        explanation: "0.75 = 75/100 = 3/4 when simplified by dividing both numerator and denominator by 25.",
        hint: "Convert the decimal to a fraction with denominator 100, then simplify.",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "If 2x + 5 = 11, what is the value of x?",
        type: "multiple_choice",
        options: ["A) 2", "B) 3", "C) 4", "D) 8"],
        correct_answer: 1,
        explanation: "2x + 5 = 11, so 2x = 11 - 5 = 6, therefore x = 6/2 = 3.",
        hint: "Subtract 5 from both sides, then divide both sides by 2.",
        difficulty_level: "medium"
      }
    ],
    science: [
      {
        id: 1,
        question: "What do green plants need to make their own food?",
        type: "multiple_choice",
        options: ["A) Soil and water only", "B) Sunlight, carbon dioxide, and water", "C) Only sunlight", "D) Only carbon dioxide"],
        correct_answer: 1,
        explanation: "Plants need sunlight, carbon dioxide from air, and water from soil to perform photosynthesis and make their own food.",
        hint: "Think about the process of photosynthesis - what inputs does it require?",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "Which of the following animals is a herbivore?",
        type: "multiple_choice",
        options: ["A) Lion", "B) Tiger", "C) Rabbit", "D) Eagle"],
        correct_answer: 2,
        explanation: "A rabbit is a herbivore because it only eats plants. Lions, tigers, and eagles are carnivores that eat other animals.",
        hint: "Think about what each animal eats. Which one only eats plants?",
        difficulty_level: "easy"
      },
      {
        id: 3,
        question: "What happens to water when it is heated?",
        type: "multiple_choice",
        options: ["A) It becomes ice", "B) It turns into steam", "C) It becomes heavier", "D) Nothing happens"],
        correct_answer: 1,
        explanation: "When water is heated, it turns into steam (water vapor). This is the process of evaporation.",
        hint: "Think about what happens when you boil water in a pot.",
        difficulty_level: "easy"
      }
    ],
    english: [
      {
        id: 1,
        question: "Which of the following is a noun?",
        type: "multiple_choice",
        options: ["A) Run", "B) Beautiful", "C) Book", "D) Quickly"],
        correct_answer: 2,
        explanation: "A noun is a word that names a person, place, thing, or idea. 'Book' is a thing, so it's a noun.",
        hint: "A noun names a person, place, thing, or idea. Which word names a thing?",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "Complete the sentence: 'She _____ to school every day.'",
        type: "multiple_choice",
        options: ["A) go", "B) going", "C) goes", "D) gone"],
        correct_answer: 2,
        explanation: "'Goes' is correct because the subject 'She' is singular and the sentence is in simple present tense.",
        hint: "The subject is 'She' which is singular. What verb form goes with singular subjects?",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "What type of sentence is this: 'What time is it?'",
        type: "multiple_choice",
        options: ["A) Statement", "B) Question", "C) Command", "D) Exclamation"],
        correct_answer: 1,
        explanation: "This is a question because it asks for information and ends with a question mark.",
        hint: "Look at the punctuation mark at the end of the sentence.",
        difficulty_level: "easy"
      }
    ]
  }

  return questionBank[subject as keyof typeof questionBank] || questionBank.mathematics
}

function getGrade10Questions(subject: string) {
  const questionBank = {
    mathematics: [
      {
        id: 1,
        question: "Find the zeroes of the quadratic polynomial: x² - 5x + 6",
        type: "multiple_choice",
        options: ["A) x = 2, 3", "B) x = 1, 6", "C) x = -2, -3", "D) x = 2, -3"],
        correct_answer: 0,
        explanation: "Using factorization: x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3",
        hint: "Try to factor the polynomial into two linear factors",
        difficulty_level: "medium"
      },
      {
        id: 2,
        question: "In an arithmetic progression, if a = 5 and d = 3, find the 10th term.",
        type: "multiple_choice",
        options: ["A) 32", "B) 29", "C) 35", "D) 26"],
        correct_answer: 0,
        explanation: "Using formula: aₙ = a + (n-1)d = 5 + (10-1)×3 = 5 + 27 = 32",
        hint: "Use the formula aₙ = a + (n-1)d for arithmetic progression",
        difficulty_level: "easy"
      },
      {
        id: 3,
        question: "What is the value of sin²θ + cos²θ?",
        type: "multiple_choice",
        options: ["A) 1", "B) 0", "C) 2", "D) sin θ × cos θ"],
        correct_answer: 0,
        explanation: "This is the fundamental trigonometric identity: sin²θ + cos²θ = 1 for any angle θ",
        hint: "This is one of the most important trigonometric identities in Chapter 8",
        difficulty_level: "easy"
      }
    ],
    science: [
      {
        id: 1,
        question: "Which of the following is the correct chemical formula for sodium chloride?",
        type: "multiple_choice",
        options: ["A) NaCl", "B) NaCl₂", "C) Na₂Cl", "D) NaClO"],
        correct_answer: 0,
        explanation: "Sodium (Na⁺) and Chloride (Cl⁻) combine in 1:1 ratio to form NaCl (common salt)",
        hint: "Consider the charges on sodium (+1) and chloride (-1) ions",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "What happens to the image when an object is placed at the focus of a convex lens?",
        type: "multiple_choice",
        options: ["A) Real, inverted, highly magnified", "B) Virtual, erect, magnified", "C) Image formed at infinity", "D) No image is formed"],
        correct_answer: 2,
        explanation: "When object is at focus F, the refracted rays are parallel, so image is formed at infinity",
        hint: "Think about what happens to parallel rays after passing through a convex lens (Chapter 1)",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "In Mendel's monohybrid cross, what is the phenotypic ratio in F2 generation?",
        type: "multiple_choice",
        options: ["A) 1:1", "B) 3:1", "C) 9:3:3:1", "D) 1:2:1"],
        correct_answer: 1,
        explanation: "In monohybrid cross, F2 generation shows 3:1 phenotypic ratio (3 dominant : 1 recessive)",
        hint: "Remember Mendel's law of dominance from Chapter 11 - Heredity and Evolution",
        difficulty_level: "hard"
      }
    ],
    english: [
      {
        id: 1,
        question: "Choose the correct form: 'If I _____ rich, I would help the poor.'",
        type: "multiple_choice",
        options: ["A) am", "B) was", "C) were", "D) will be"],
        correct_answer: 2,
        explanation: "This is a second conditional (unreal condition). Use 'were' for all persons in the if-clause",
        hint: "This is an unreal condition in the present. What form of 'be' do we use?",
        difficulty_level: "medium"
      },
      {
        id: 2,
        question: "What is the theme of the poem 'Dust of Snow' by Robert Frost?",
        type: "multiple_choice",
        options: ["A) Love for nature", "B) Change of mood", "C) Winter season", "D) Animal behavior"],
        correct_answer: 1,
        explanation: "The poem shows how a simple incident in nature can change one's mood from sad to happy",
        hint: "Think about how the poet's day was saved by a simple natural event",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "Identify the type of sentence: 'Please close the door.'",
        type: "multiple_choice",
        options: ["A) Declarative", "B) Interrogative", "C) Imperative", "D) Exclamatory"],
        correct_answer: 2,
        explanation: "This is an imperative sentence because it gives a command or request",
        hint: "What type of sentence gives commands or requests?",
        difficulty_level: "easy"
      }
    ],
    social_studies: [
      {
        id: 1,
        question: "Who founded the Indian National Congress in 1885?",
        type: "multiple_choice",
        options: ["A) Bal Gangadhar Tilak", "B) A.O. Hume", "C) Dadabhai Naoroji", "D) Gopal Krishna Gokhale"],
        correct_answer: 1,
        explanation: "Allan Octavian Hume, a retired British civil servant, founded the Indian National Congress in 1885",
        hint: "Think about the early British administrators who supported Indian political development",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "Which river is known as the 'Sorrow of Bengal'?",
        type: "multiple_choice",
        options: ["A) Ganges", "B) Damodar", "C) Brahmaputra", "D) Mahanadi"],
        correct_answer: 1,
        explanation: "Damodar river was called 'Sorrow of Bengal' due to frequent flooding before dam construction",
        hint: "This river was notorious for floods in West Bengal before multipurpose projects",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "What is the full form of GDP?",
        type: "multiple_choice",
        options: ["A) Gross Domestic Price", "B) Gross Domestic Product", "C) General Domestic Product", "D) Great Domestic Product"],
        correct_answer: 1,
        explanation: "GDP stands for Gross Domestic Product, which measures the total value of goods and services produced in a country",
        hint: "This is an important economic indicator measuring a country's economic output",
        difficulty_level: "easy"
      }
    ],
    tamil: [
      {
        id: 1,
        question: "திருக்குறள் எத்தனை அதிகாரங்களைக் கொண்டுள்ளது?",
        type: "multiple_choice",
        options: ["A) 130", "B) 133", "C) 108", "D) 120"],
        correct_answer: 1,
        explanation: "திருக்குறள் 133 அதிகாரங்களைக் கொண்டுள்ளது. ஒவ்வொரு அதிகாரத்திலும் 10 குறள்கள் உள்ளன",
        hint: "திருவள்ளுவர் அருளிய திருக்குறளின் அமைப்பை நினைவுகூருங்கள்",
        difficulty_level: "easy"
      },
      {
        id: 2,
        question: "எந்த இலக்கண நூல் 'தமிழ் மொழியின் முதல் இலக்கணம்' என அழைக்கப்படுகிறது?",
        type: "multiple_choice",
        options: ["A) நன்னூல்", "B) தொல்காப்பியம்", "C) வீரசோழியம்", "D) இலக்கண விளக்கம்"],
        correct_answer: 1,
        explanation: "தொல்காப்பியம் தமிழ் மொழியின் முதல் இலக்கண நூலாகும். இது தொல்காப்பியர் என்ற முனிவரால் எழுதப்பட்டது",
        hint: "இது மிகவும் பழமையான தமிழ் இலக்கண நூல்",
        difficulty_level: "medium"
      },
      {
        id: 3,
        question: "'யாதும் ஊரே யாவரும் கேளிர்' என்ற பழமொழி எந்த நூலில் இருந்து வந்தது?",
        type: "multiple_choice",
        options: ["A) திருக்குறள்", "B) புறநானூறு", "C) குறுந்தொகை", "D) நாலடியார்"],
        correct_answer: 1,
        explanation: "இந்த புகழ்பெற்ற வரிகள் புறநானூற்றில் இருந்து வந்தவை. இது உலகமயமாக்கலின் தமிழ் வெளிப்பாடு",
        hint: "இது சங்க இலக்கியத்தின் ஒரு புகழ்பெற்ற தொகுப்பில் இருந்து வந்தது",
        difficulty_level: "hard"
      }
    ]
  }

  return questionBank[subject as keyof typeof questionBank] || questionBank.mathematics
}