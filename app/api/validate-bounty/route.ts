import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ValidationRequest {
  url: string;
  requirements: string;
}

interface ValidationResponse {
  valid: boolean;
  explanation: string;
}

const validationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    valid: {
      type: SchemaType.BOOLEAN,
      description: "Whether the video meets all the specified bounty requirements"
    },
    explanation: {
      type: SchemaType.STRING,
      description: "Brief explanation of why the video meets or doesn't meet the requirements"
    }
  },
  required: ["valid", "explanation"]
};

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Validate bounty API called');
    const body: ValidationRequest = await request.json();
    const { url, requirements } = body;

    console.log('Validation request:', { url, requirements });

    if (!url || !requirements) {
      console.log('Error: Missing required fields - url:', !!url, 'requirements:', !!requirements);
      return NextResponse.json(
        { error: 'URL and requirements are required' },
        { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(url)) {
      console.log('Error: Invalid YouTube URL:', url);
      return NextResponse.json({
        valid: false,
        explanation: 'URL must be a valid YouTube video URL'
      } as ValidationResponse);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('Error: Gemini API key not configured');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: validationSchema
      }
    });

    const prompt = `
You are a content moderator reviewing a YouTube video submission for a UGC bounty program.

VIDEO TO REVIEW: ${url}
BOUNTY REQUIREMENTS: ${requirements}

IMPORTANT: You MUST actually watch and analyze the video content at the provided URL. Do not make assumptions or generic responses.

Your task:
1. Watch the entire video at the URL
2. Check if the video content actually meets the specific bounty requirements
3. Look for the required product, action, or content specified in the requirements

For the validation response:
- If the video meets ALL requirements: Set valid=true and explain what the video did correctly
- If the video does NOT meet requirements: Set valid=false and provide clear, specific feedback for the creator about what was missing

Example feedback format for creators:
- "Your video needs to show the green sushi hat prominently" 
- "The video should demonstrate the product in use"
- "Make sure to mention or show [specific requirement]"

Focus specifically on:
- Is the required product/item visible in the video?
- Does the content match what was requested in the requirements?
- Are any specific actions or mentions required that are missing?

Provide direct, actionable feedback that helps the creator understand exactly what to improve.
`;

    console.log('Calling Gemini with prompt:', prompt.substring(0, 200) + '...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    const parsedResponse = JSON.parse(text);
    console.log('Parsed response:', parsedResponse);
    
    return NextResponse.json(parsedResponse as ValidationResponse);

  } catch (error) {
    console.error('Error validating bounty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
