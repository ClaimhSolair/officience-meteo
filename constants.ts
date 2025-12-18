import { DealStage } from "./types";

// Financial Targets
export const FINANCIALS = {
  ANNUAL_TARGET: 3590000,
  QUARTER_TARGET: 897500,
  WON_REVENUE_YTD: 2569361
};

// Unified Dark Theme Colors
export const STAGE_COLORS: Record<DealStage, string> = {
  [DealStage.PROSPECTING]: 'bg-gray-800/50 text-gray-300 border border-gray-700',
  [DealStage.QUALIFICATION]: 'bg-blue-900/20 text-blue-200 border border-blue-800/30',
  [DealStage.PROPOSAL]: 'bg-gold-500/10 text-gold-400 border border-gold-500/20', // Signature Gold
  [DealStage.NEGOTIATION]: 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  [DealStage.CLOSED_WON]: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40',
  [DealStage.CLOSED_LOST]: 'bg-red-900/10 text-red-400 border border-red-800/20',
};

export const RISK_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-gold-400', 
  high: 'text-red-500', 
};

// Forecast Stage Probabilities (Fallback lookup)
export const STAGE_PROBABILITIES: Record<string, number> = {
  'leads': 0.1,
  'prospecting': 0.1,
  'qualification': 0.2,
  'demo': 0.4,
  'proposal': 0.4,
  'verbal': 0.6,
  'negotiation': 0.6,
  'closing': 0.8,
  'closed won': 1.0,
  'closed lost': 0.0
};

// Ranking Calculation Weights
export const RANKING_WEIGHTS = {
  STAGE: {
    [DealStage.PROSPECTING]: 0.1,
    [DealStage.QUALIFICATION]: 0.2,
    [DealStage.PROPOSAL]: 0.5,
    [DealStage.NEGOTIATION]: 0.8,
    [DealStage.CLOSED_WON]: 1.0,
    [DealStage.CLOSED_LOST]: 0.0,
  },
  PRIORITY: {
    high: 1.2,
    medium: 1.0,
    low: 0.8
  }
};

export const STRESS_WEIGHTS = {
  STAGE_SCORE: {
    [DealStage.PROSPECTING]: 1, 
    [DealStage.QUALIFICATION]: 2,
    [DealStage.PROPOSAL]: 3,
    [DealStage.NEGOTIATION]: 5,
    [DealStage.CLOSED_WON]: 0,
    [DealStage.CLOSED_LOST]: 0,
  },
  CRITICAL_HEALTH_PENALTY: 4,
  HIGH_VALUE_THRESHOLD: 100000,
  HIGH_VALUE_PENALTY: 2,
};