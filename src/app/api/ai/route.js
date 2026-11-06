import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt, systemInstruction, imageBase64 } = await request.json();

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { error: 'Prompt or imageBase64 is required.' },
        { status: 400 }
      );
    }

    const contents = [];

    if (imageBase64) {
      let mimeType = 'image/jpeg';
      let data = imageBase64;

      if (imageBase64.includes(';base64,')) {
        const splitData = imageBase64.split(';base64,');
        mimeType = splitData[0].replace('data:', '') || 'image/jpeg';
        data = splitData[1];
      }

      contents.push({
        inlineData: {
          mimeType,
          data,
        },
      });
    }

    if (prompt) {
      contents.push(prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are an intelligent AI assistant. Always output structured JSON according to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: {
              type: Type.BOOLEAN,
              description: 'Whether the operation or analysis was successful',
            },
            title: {
              type: Type.STRING,
              description: 'Concise title or heading for the result',
            },
            summary: {
              type: Type.STRING,
              description: 'Detailed summary or explanation of the result',
            },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                details: {
                  type: Type.STRING,
                  description: 'Detailed findings, analysis, or answer',
                },
                rawJson: {
                  type: Type.STRING,
                  description: 'Optional raw JSON string or extra unstructured payload',
                },
              },
              description: 'Flexible structured data extracted from the prompt or media',
            },
          },
          required: ['success', 'title', 'summary'],
        },
      },
    });

    const rawText = response.text;
    let parsedData;

    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        success: true,
        title: 'AI Response',
        summary: rawText,
        extractedData: {},
      };
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
