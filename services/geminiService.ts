import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFamilyBio = async (
  name: string,
  birthYear: string,
  relation: string,
  keywords: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key missing. Cannot generate bio.";

  try {
    const prompt = `
      Write a short, dignified, and warm biography (max 100 words) for a family tree member.
      Name: ${name}
      Birth Year: ${birthYear}
      Role in family: ${relation}
      Key traits/facts: ${keywords}
      
      Tone: Respectful, familial, celebrating heritage.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No bio generated.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Error generating bio. Please try again.";
  }
};
