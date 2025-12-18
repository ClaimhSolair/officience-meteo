import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Deal, DealStage } from "../types";
import { STRESS_WEIGHTS, FINANCIALS } from "../constants";

// Vite exposes env vars with VITE_ prefix via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.5-flash';

// Helper for retry logic with exponential backoff
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Immediate fallback for Quota errors (429)
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn("Gemini Quota Exceeded. Returning fallback.");
      throw new Error("QUOTA_EXCEEDED");
    }

    if (retries <= 0) throw error;
    console.warn(`Gemini API call failed. Retrying... Attempts left: ${retries}. Error:`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export const generateDailyBrief = async (deals: Deal[]) => {
  if (!apiKey) return { priorities: ["Configure API Key to see insights"], meetingPrep: [] };

  // Initialize client inside function for robustness
  const ai = new GoogleGenAI({ apiKey });

  // 1. Calculate Forecast Aggregates (from full list)
  const totalWeighted = deals.reduce((sum, d) => sum + (d.weightedValue || 0), 0);
  const totalAdjusted = deals.reduce((sum, d) => sum + (d.aiWeightedValue || 0), 0);
  const forecastGap = totalAdjusted - totalWeighted;
  
  const redDeals = deals.filter(d => d.health === 'red');
  const slippageDeals = deals.filter(d => d.slippage);
  
  const lowHangingFruit = [...deals]
    .sort((a, b) => (b.aiProbability || 0) - (a.aiProbability || 0))
    .slice(0, 3)
    .map(d => d.title);

  // 2. Prepare Context for AI
  const forecastContext = `
    FORECAST INTELLIGENCE:
    - Standard Weighted Pipeline: €${Math.round(totalWeighted).toLocaleString()}
    - Adjusted Forecast: €${Math.round(totalAdjusted).toLocaleString()}
    - Forecast Gap: €${Math.round(forecastGap).toLocaleString()}
    - Critical Health Deals (Count): ${redDeals.length}
    - Deals with Slippage (Count): ${slippageDeals.length}
    - High Potential Deals: ${lowHangingFruit.join(', ')}
    - Critical Red Deals Examples: ${redDeals.slice(0, 3).map(d => d.title).join(', ')}
  `;

  // 3. Limit detailed JSON payload to avoid token limits & timeouts
  const prioritizedDeals = [...deals].sort((a, b) => {
    // Custom sort: Health Red first, then Value desc
    if (a.health === 'red' && b.health !== 'red') return -1;
    if (a.health !== 'red' && b.health === 'red') return 1;
    return b.value - a.value;
  }).slice(0, 10);

  const dealsJson = JSON.stringify(prioritizedDeals.map(d => ({
    title: d.title,
    stage: d.stage,
    value: d.value,
    risk: d.riskLevel,
    health: d.health, // red/amber/green
    slippage: d.slippage,
    nextStep: d.nextStep ? d.nextStep.substring(0, 100) : 'None' 
  })));

  const prompt = `
    You are an AI Sales Strategist.
    
    ${forecastContext}

    Analyze the specific deal details below (Subset of ${deals.length} active deals):
    ${dealsJson}

    Create a concise Daily Briefing.
    
    REQUIREMENTS:
    1. Top Priorities: Exactly 3 actionable items. Prioritize "Red" health deals or slipped deals.
    2. Prep: Exactly 3 preparation tips. Focus on moving stuck deals or closing high potential ones.
    
    TONE CONSTRAINT: Be extremely concise. Use clear, direct business language.
    CONTENT CONSTRAINT: Do NOT mention "AI Probability", "Win Prob", or specific percentage numbers related to AI prediction. Focus on the *action* needed.

    Return JSON matching this schema:
    {
      "priorities": ["string", "string", "string"],
      "meetingPrep": ["string", "string", "string"]
    }
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            meetingPrep: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["priorities", "meetingPrep"]
        }
      }
    }));

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Empty response");
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
        return {
            priorities: ["(System Alert) AI Analysis Quota Exceeded.", "Please check your API billing plan.", "Focus on manually flagged critical deals."],
            meetingPrep: ["Review deal notes manually.", "Check 'Last Contact' dates.", "Update deal stages directly."]
        };
    }
    console.error("Gemini Brief Error:", error);
    return {
      priorities: ["Check internet connection", "Try refreshing the page", "Verify API Key"],
      meetingPrep: []
    };
  }
};

export const analyzeDealVibe = async (deal: Deal) => {
  if (!apiKey) return { vibe: "Neutral", advice: "Add API Key to see insights." };

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this deal for company "${deal.companyName}".
    Stage: ${deal.stage}
    Value: $${deal.value}
    Last Contact: ${deal.lastContactDate}
    Owner: ${deal.ownerName}
    Priority/Risk: ${deal.riskLevel}
    
    1. Provide a "Vibe Check" (Positive, Caution, or Critical) in one word.
    2. Provide "Advice" in exactly 3 concise bullet points following this specific order:
       1. Action needed.
       2. Evaluation based on priority and delay.
       3. Who needs to be followed up (Name from Primary Contact).
    
    CONSTRAINT: Be extremely concise. Max 15 words per bullet point.
    
    Return JSON:
    {
      "vibe": "string",
      "advice": ["string", "string", "string"]
    }
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             vibe: { type: Type.STRING },
             advice: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }));
    const text = response.text;
    return text ? JSON.parse(text) : { vibe: "Unknown", advice: ["No data returned."] };
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
         return { vibe: "Paused", advice: ["AI Quota Exceeded.", "Please check billing.", "Manual review required."] };
    }
    console.error("Gemini Deal Analysis Error:", error);
    return { vibe: "Error", advice: ["Could not analyze."] };
  }
};

export const chatWithGlobalAssistant = async (deals: Deal[], message: string, history: any[]) => {
  if (!apiKey) return { text: "Please configure your API Key to chat." };

  const ai = new GoogleGenAI({ apiKey });

  // --- 1. Calculate Forecast Context ---
  const activeDeals = deals.filter(d => d.stage !== DealStage.CLOSED_LOST && d.stage !== DealStage.CLOSED_WON);
  const totalPipeline = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const totalWeighted = activeDeals.reduce((sum, d) => sum + (d.weightedValue || 0), 0);
  const totalAdjusted = activeDeals.reduce((sum, d) => sum + (d.aiWeightedValue || 0), 0);
  const aiDelta = totalAdjusted - totalWeighted;

  const forecastContext = `
    - Total Active Pipeline: €${Math.round(totalPipeline).toLocaleString()}
    - Weighted Forecast: €${Math.round(totalWeighted).toLocaleString()}
    - AI Adjusted Forecast: €${Math.round(totalAdjusted).toLocaleString()} (Delta: €${Math.round(aiDelta).toLocaleString()})
  `;

  // --- 2. Staffing Context ---
  // (simplified for brevity to save tokens)
  const staffingRisks = "Burnout analysis active.";

  // --- 3. Simplify Deal Data ---
  const simpleDeals = deals.map(d => ({
    id: d.id,
    title: d.title,
    company: d.companyName,
    value: d.value,
    stage: d.stage,
    health: d.health
  }));

  const systemInstruction = `
    You are Otty, the Project Meteo Strategist.
    
    [EXECUTIVE DASHBOARD DATA]
    1. FORECAST METRICS:
    ${forecastContext}
    
    3. PIPELINE DATABASE (All Deals):
    ${JSON.stringify(simpleDeals).substring(0, 30000)}
    
    INSTRUCTIONS:
    - Answer user questions about the sales pipeline.
    - Be professional, concise, and strategic.
  `;

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: { systemInstruction }
    });

    const result = await retryOperation<GenerateContentResponse>(() => chat.sendMessage({ message }));
    
    return { text: result.text };

  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
         return { text: "I've hit my thinking limit for now (Quota Exceeded). Please check your API billing or try again later." };
    }
    console.error("Chat Error:", error);
    return { text: "I'm having trouble connecting to the strategy center right now. Please try again in a moment." };
  }
};