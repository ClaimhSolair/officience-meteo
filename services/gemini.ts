import { Deal, DealStage } from "../types";

// ============================================================
// 🚫 ALL GEMINI API CALLS DISABLED TO MINIMIZE COSTS
// ============================================================
// To re-enable AI features in the future:
// 1. Uncomment the API code below
// 2. Add VITE_GEMINI_API_KEY to Vercel environment variables
// 3. Redeploy
// ============================================================

// API is intentionally disabled - no imports needed
// import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const generateDailyBrief = async (deals: Deal[]) => {
  // API DISABLED - Return static insights based on deal data
  
  const redDeals = deals.filter(d => d.health === 'red');
  const slippageDeals = deals.filter(d => d.slippage);
  const highValueDeals = [...deals].sort((a, b) => b.value - a.value).slice(0, 3);
  
  // Generate static priorities based on actual data
  const priorities: string[] = [];
  
  if (redDeals.length > 0) {
    priorities.push(`Review ${redDeals.length} critical health deal(s): ${redDeals.slice(0, 2).map(d => d.title).join(', ')}`);
  } else {
    priorities.push("No critical health deals - focus on advancing pipeline");
  }
  
  if (slippageDeals.length > 0) {
    priorities.push(`Address ${slippageDeals.length} slipped deal(s) - update close dates or re-engage`);
  } else {
    priorities.push("Pipeline on track - no slipped deals detected");
  }
  
  if (highValueDeals.length > 0) {
    priorities.push(`Prioritize high-value opportunities: ${highValueDeals[0].title} (€${highValueDeals[0].value.toLocaleString()})`);
  } else {
    priorities.push("Review pipeline for new opportunities");
  }

  // Generate static meeting prep
  const meetingPrep: string[] = [
    `Active deals in pipeline: ${deals.filter(d => d.stage !== DealStage.CLOSED_LOST && d.stage !== DealStage.CLOSED_WON).length}`,
    "Review last contact dates for stale deals",
    "Update deal stages and next steps"
  ];

  return { priorities, meetingPrep };
};

export const analyzeDealVibe = async (deal: Deal) => {
  // API DISABLED - Return static analysis based on deal data
  
  let vibe = "Neutral";
  const advice: string[] = [];
  
  // Determine vibe based on deal health and risk
  if (deal.health === 'red' || deal.riskLevel === 'high') {
    vibe = "Critical";
    advice.push("Immediate attention required");
    advice.push(`Deal inactive for ${deal.inactiveDays || 'unknown'} days`);
    advice.push("Schedule urgent follow-up with stakeholder");
  } else if (deal.health === 'amber' || deal.riskLevel === 'medium') {
    vibe = "Caution";
    advice.push("Monitor closely for progress");
    advice.push("Review blockers and next steps");
    advice.push("Consider escalation if no movement");
  } else {
    vibe = "Positive";
    advice.push("Deal progressing normally");
    advice.push("Continue regular engagement");
    advice.push("Prepare for next stage advancement");
  }

  return { vibe, advice };
};

// ============================================================
// DISABLED CODE - KEEP FOR FUTURE REFERENCE
// ============================================================
/*
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.5-flash';

// ... original API code here ...
*/
