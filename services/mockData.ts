import { Deal, DealStage, ActivityType } from "../types";

export const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Enterprise License Expansion',
    companyName: 'Acme Corp',
    stage: DealStage.NEGOTIATION,
    value: 120000,
    ownerName: 'Sarah Jenkins',
    probability: 80,
    lastContactDate: '2023-10-25',
    nextStep: 'Finalize contract terms',
    riskLevel: 'low',
    contacts: [
      { id: 'c1', name: 'John Doe', role: 'CTO', email: 'john@acme.com' }
    ],
    activityLogs: [
      { id: 'a1', type: ActivityType.MEETING, date: '2023-10-25', summary: 'Discussed implementation timeline. They are eager to start by Q1.', sentiment: 'positive' },
      { id: 'a2', type: ActivityType.EMAIL, date: '2023-10-20', summary: 'Sent over updated pricing deck.', sentiment: 'neutral' }
    ]
  },
  {
    id: '2',
    title: 'Q4 Marketing Software Deal',
    companyName: 'Globex Inc.',
    stage: DealStage.PROPOSAL,
    value: 45000,
    ownerName: 'Mike Ross',
    probability: 60,
    lastContactDate: '2023-10-18',
    nextStep: 'Schedule demo with VP',
    riskLevel: 'medium',
    contacts: [
      { id: 'c2', name: 'Jane Smith', role: 'VP Marketing', email: 'jane@globex.com' }
    ],
    activityLogs: [
      { id: 'a3', type: ActivityType.CALL, date: '2023-10-18', summary: 'Left voicemail. No response yet.', sentiment: 'negative' },
      { id: 'a4', type: ActivityType.EMAIL, date: '2023-10-15', summary: 'Follow up on previous demo.', sentiment: 'neutral' }
    ]
  },
  {
    id: '3',
    title: 'Global API Integration',
    companyName: 'Stark Industries',
    stage: DealStage.QUALIFICATION,
    value: 850000,
    ownerName: 'Sarah Jenkins',
    probability: 30,
    lastContactDate: '2023-10-26',
    nextStep: 'Technical feasibility study',
    riskLevel: 'low',
    contacts: [
      { id: 'c3', name: 'Tony S.', role: 'CEO', email: 'tony@stark.com' }
    ],
    activityLogs: [
      { id: 'a5', type: ActivityType.MEETING, date: '2023-10-26', summary: 'Initial discovery call went great. High interest in security features.', sentiment: 'positive' }
    ]
  },
  {
    id: '4',
    title: 'Cloud Migration Project',
    companyName: 'Wayne Enterprises',
    stage: DealStage.NEGOTIATION,
    value: 500000,
    ownerName: 'Bruce W.',
    probability: 75,
    lastContactDate: '2023-10-10',
    nextStep: 'Legal review',
    riskLevel: 'high',
    contacts: [
      { id: 'c4', name: 'Lucius Fox', role: 'CIO', email: 'l.fox@wayne.com' }
    ],
    activityLogs: [
      { id: 'a6', type: ActivityType.EMAIL, date: '2023-10-10', summary: 'Sent contract for legal review. Silence since then.', sentiment: 'negative' },
      { id: 'a7', type: ActivityType.MEETING, date: '2023-10-01', summary: 'Stakeholder alignment meeting.', sentiment: 'positive' }
    ]
  },
  {
    id: '5',
    title: 'Start-up Pack',
    companyName: 'Pied Piper',
    stage: DealStage.PROSPECTING,
    value: 15000,
    ownerName: 'Richard H.',
    probability: 10,
    lastContactDate: '2023-10-27',
    nextStep: 'Identify decision maker',
    riskLevel: 'medium',
    contacts: [],
    activityLogs: []
  }
];

export const FORECAST_DATA = [
  { month: 'Aug', revenue: 40000, projected: 45000 },
  { month: 'Sep', revenue: 55000, projected: 50000 },
  { month: 'Oct', revenue: 75000, projected: 80000 },
  { month: 'Nov', revenue: 60000, projected: 95000 },
  { month: 'Dec', revenue: 90000, projected: 120000 },
  { month: 'Jan', revenue: 85000, projected: 110000 },
];