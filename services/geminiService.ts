import { Macros } from '../types';

// Using OpenRouter API via Hardcoded Key
// Requested Model: openai/gpt-oss-20b:free
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

// API Key embedded directly as requested
const API_KEY = "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";

interface AnalysisResult extends Macros {
  name: string;
  micronutrients?: string[];
  notes?: string;
}

const getHeaders = () => ({
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  "X-Title": "PSMF Cutter Pro"
});

const cleanAndParseJSON = (content: string): any => {
  try {
    // Remove markdown code blocks if present
    const clean = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.log("Raw content:", content);
    return null;
  }
};

export const analyzeFoodInput = async (inputText: string): Promise<AnalysisResult | null> => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Ты эксперт по питанию. Проанализируй прием пищи. Верни ТОЛЬКО валидный JSON без лишнего текста и markdown. Структура: { \"calories\": number, \"protein\": number, \"fat\": number, \"carbs\": number, \"name\": string, \"micronutrients\": string[], \"notes\": string }. Оценивай консервативно. Если ввод не еда, верни null."
          },
          {
            role: "user",
            content: inputText
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter API Error:", err);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    const parsed = cleanAndParseJSON(content);
    if (!parsed) return null;

    return {
      name: parsed.name || "Неизвестное блюдо",
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      fat: Number(parsed.fat) || 0,
      carbs: Number(parsed.carbs) || 0,
      micronutrients: parsed.micronutrients || [],
      notes: parsed.notes || ""
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    return null;
  }
};

export const analyzeFoodWithImage = async (base64Image: string, promptText: string = ''): Promise<AnalysisResult | null> => {
  try {
    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Ты эксперт по питанию. Определи блюдо по фото. Верни ТОЛЬКО валидный JSON без markdown. Структура: { \"calories\": number, \"protein\": number, \"fat\": number, \"carbs\": number, \"name\": string, \"micronutrients\": string[], \"notes\": string }."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText || "Оцени КБЖУ этого блюда по фото."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter API Error:", err);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return null;

    const parsed = cleanAndParseJSON(content);
    if (!parsed) return null;

    return {
      name: parsed.name || "Неизвестное блюдо (Фото)",
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      fat: Number(parsed.fat) || 0,
      carbs: Number(parsed.carbs) || 0,
      micronutrients: parsed.micronutrients || [],
      notes: parsed.notes || ""
    };

  } catch (error) {
    console.error("Image analysis failed:", error);
    return null;
  }
}