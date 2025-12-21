
import { GoogleGenAI } from "@google/genai";
import { AIRemark } from "../types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY})
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIRemark(word: string, isCorrect: boolean, streak: number): Promise<AIRemark> {
  try {
    const prompt = isCorrect 
      ? `A student correctly translated "${word}". Streak: ${streak}. Give a 1-sentence funny cosmic encouragement with emojis.`
      : `Student needs a tiny hint for the English word "${word}". Don't say the word. Encourage them.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are Sparky, a cheerful space robot. Be lightning fast. MAX 10 words. 🤖🚀",
        temperature: 0.7,
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for immediate response
      }
    });

    return {
      text: response.text?.trim() || "Onward, Cadet! 🚀",
      type: isCorrect ? 'encouragement' : 'hint'
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: isCorrect ? "Great job! 🌟" : "Don't give up! 🛸",
      type: isCorrect ? 'encouragement' : 'hint'
    };
  }
}
