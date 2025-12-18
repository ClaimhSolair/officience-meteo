export enum DealStage {
  PROSPECTING = 'Prospecting',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum ActivityType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  NOTE = 'note',
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  date: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface Deal {
  id: string;
  title: string;
  companyName: string;
  stage: DealStage;
  value: number;
  ownerName: string;
  probability: number;
  lastContactDate: string;
  nextStep: string;
  activityLogs: ActivityLog[];
  contacts: Contact[];
  riskLevel: 'low' | 'medium' | 'high';
  createdDate?: string;
  
  // Forecasting Metrics
  dealDate?: string; // Target Close Date
  stageDurationDays?: number;
  interactionCount?: number;
  inactiveDays?: number;
  
  // Calculated Metrics
  weightedValue?: number;
  momentumScore?: number;
  aiProbability?: number;
  aiWeightedValue?: number;
  health?: 'green' | 'amber' | 'red';
  slippage?: boolean;
}

export interface DailyBrief {
  priorities: string[];
  meetingPrep: string[];
}

export interface ForecastData {
  month: string;
  revenue: number;
  projected: number;
}

export interface StaffingProfile {
  name: string;
  dealCount: number;
  activeValue: number;
  stressScore: number;
  burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  criticalDeals: number;
  negotiationCount: number;
  deals: Deal[];
}