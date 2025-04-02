//import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

//const API_KEY = process.env.GOOGLE_API_KEY; //store your api key in .env

export async function POST(request) {
    
    const { mood } = await request.json();

    try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/gemini/generate_playlist_description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend API Error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to generate playlist description from backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ playlistDescription: data.playlistDescription });

  } catch (error) {
    console.error("Error calling backend:", error);
    return NextResponse.json(
      { error: "Failed to communicate with backend" },
      { status: 500 }
    );
  }
    
    {/*
  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Briefly describe a playlist that fits the mood: ${mood}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ playlistDescription: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate playlist description" },
      { status: 500 }
    );
  }

     */}

}
