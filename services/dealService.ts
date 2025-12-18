import { Deal, DealStage } from '../types';
import { STAGE_PROBABILITIES } from '../constants';

const SHEET_ID = '1rS2cKEDKv7dMESSaoVRw5Cj_PIv5xzr1-sRdtVRHmjU';
const SHEET_NAME = 'Deals';

// --- GOOGLE SHEETS FETCHING ---

// Use JSONP to fetch data directly from Google Sheets without CORS proxies.
const loadGoogleSheetJSONP = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'googleSheetCallback_' + Math.floor(Math.random() * 100000);
    
    (window as any)[callbackName] = (response: any) => {
      delete (window as any)[callbackName];
      if (document.body.contains(script)) {
         document.body.removeChild(script);
      }
      resolve(response);
    };

    const script = document.createElement('script');
    // Encode the sheet name to ensure we get the correct tab
    script.src = `${url}&tqx=responseHandler:${callbackName}&tq=SELECT *`;
    script.onerror = () => {
      delete (window as any)[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      reject(new Error('Failed to load Google Sheet script. Check your network or Sheet permissions.'));
    };
    document.body.appendChild(script);
  });
};

export const fetchDeals = async (): Promise<Deal[]> => {
  console.log(`Fetching deals from sheet: "${SHEET_NAME}"...`);
  
  // Construct URL with specific sheet name and headers=1
  const encodedSheetName = encodeURIComponent(SHEET_NAME);
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodedSheetName}&headers=1`;

  try {
    const response = await loadGoogleSheetJSONP(url);
    
    if (response.status === 'error') {
        console.error("Google Sheet API Error:", response.errors);
        return [];
    }

    const table = response.table;
    if (!table || !table.cols || !table.rows) {
        console.error("Invalid data format from Google Sheets");
        return [];
    }

    const deals = parseGVizData(table);
    return deals;

  } catch (e) {
    console.error("Error fetching deals:", e);
    return [];
  }
};

function parseGVizData(table: any): Deal[] {
  // Create a map of column label to index.
  const colMap: Record<string, number> = {};
  
  table.cols.forEach((col: any, i: number) => {
    if (col && col.label) {
      const label = col.label.toLowerCase().trim();
      colMap[label] = i;
      // Store with underscores
      colMap[label.replace(/\s+/g, '_')] = i;
    }
  });
  
  return table.rows.map((row: any, index: number) => {
    const getValue = (keys: string[]): string => {
      for (const key of keys) {
        const idx = colMap[key.toLowerCase()];
        if (idx !== undefined && row.c[idx]) {
          const cell = row.c[idx];
          // Use formatted value (f) if available for text/dates, value (v) for raw numbers
          return cell.v !== null ? String(cell.v) : '';
        }
      }
      return '';
    };

    return mapRowToDeal(getValue, index.toString());
  }).filter((deal: Deal) => {
    // Valid deals must have a company name or title
    return deal.companyName && deal.companyName !== 'Unknown';
  });
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Handle Google Visualization Date format: "Date(2023,10,25)"
  if (dateStr.startsWith('Date(')) {
     const nums = dateStr.match(/\d+/g);
     if (nums && nums.length >= 3) {
         // Month is 0-indexed in JS Date
         const d = new Date(parseInt(nums[0]), parseInt(nums[1]), parseInt(nums[2]));
         if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
         }
     }
  }

  const cleanDate = dateStr.replace(/["']/g, '').trim();
  
  // "YYYY-MM-DD"
  if (cleanDate.match(/^\d{4}-\d{2}-\d{2}/)) {
    return cleanDate.split(/[ ,]+/)[0];
  }

  // "MM/DD/YYYY"
  if (cleanDate.includes('/')) {
      const d = new Date(cleanDate);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
  }

  return cleanDate;
}

function mapRowToDeal(getValue: (keys: string[]) => string, index: string): Deal {
  // Added '#_id' to match standard Google Sheet " # id" column label parsing
  const id = getValue(['id', '#_id', 'deal_id']) || `row-${index}`;
  const company = getValue(['primary_organization', 'organization', 'company']) || 'Unknown';
  const title = getValue(['name', 'deal_name', 'title']) || company + ' Deal'; 
  
  // Added 'assignee' as priority, moved 'tag' to end as it seems to be industry in new sheet
  const ownerName = getValue(['assignee', 'owner', 'assigned_to', 'tag']) || 'Unassigned';

  // Value
  const valueStr = getValue(['converted_value', 'value', 'amount']) || '0';
  const cleanValueStr = valueStr.replace(/[^0-9.]/g, ''); 
  const value = parseFloat(cleanValueStr) || 0;

  // Probability
  const probStr = getValue(['win_prob', 'probability', 'win_probability']) || '0';
  const cleanProbStr = probStr.replace(/[^0-9.]/g, '');
  let probability = parseFloat(cleanProbStr) || 0;
  
  // Detect if probability is 0-1 range (e.g. 0.55) or 0-100 range (e.g. 55)
  if (probability > 0 && probability <= 1) {
    probability = probability * 100;
  }
  
  // Round to nearest integer to avoid floating point errors (e.g. 55.000000001)
  probability = Math.round(probability);

  // Dates
  const dateRaw = getValue(['updated_date', 'last_stage_date', 'deal_date']);
  const lastContactDate = parseDate(dateRaw);

  const createdDateRaw = getValue(['created_date', 'create_date']);
  const createdDate = parseDate(createdDateRaw);

  const dealDateRaw = getValue(['deal_date', 'close_date']);
  const dealDate = parseDate(dealDateRaw);

  // --- IMPROVED STAGE MAPPING ---
  const rawStage = getValue(['stage_name', 'stage']) || '';
  const status = getValue(['status']) || 'Open';
  const s = rawStage.toLowerCase();
  const st = status.toLowerCase();

  let stage = DealStage.PROSPECTING;

  if (st.includes('lost') || st.includes('aband') || st.includes('archive') || s.includes('lost')) {
    stage = DealStage.CLOSED_LOST;
  } else if (st.includes('won') || s.includes('won')) {
    stage = DealStage.CLOSED_WON;
  } else {
    // Robust Keyword Matching for standard sales stages
    if (s.includes('prospect') || s.includes('lead') || s.includes('new')) {
      stage = DealStage.PROSPECTING;
    } 
    else if (s.includes('qualif') || s.includes('need') || s.includes('discov') || s.includes('analy') || s.includes('interest')) {
      stage = DealStage.QUALIFICATION;
    } 
    else if (s.includes('propos') || s.includes('demo') || s.includes('present') || s.includes('value') || s.includes('solution')) {
      stage = DealStage.PROPOSAL;
    } 
    else if (s.includes('negotia') || s.includes('contract') || s.includes('review') || s.includes('verbal') || s.includes('closing') || s.includes('commit')) {
      stage = DealStage.NEGOTIATION;
    }
    // Fallback if no keywords match but status is Open
    else {
      stage = DealStage.PROSPECTING;
    }
  }

  // Priority
  const priority = getValue(['priority']).toLowerCase();
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (priority.includes('high') || priority.includes('critical')) riskLevel = 'high';
  else if (priority.includes('med')) riskLevel = 'medium';
  else if (priority.includes('low')) riskLevel = 'low';

  const details = getValue(['details', 'description']) || '';
  const nextStep = details.length > 50 ? details.substring(0, 50) + '...' : (details || 'No next step recorded');
  const contactName = getValue(['primary_contact', 'contact']) || 'Unknown';

  // --- FORECASTING ENGINE ---

  // 1. Metrics Extraction
  const interactionCount = parseFloat(getValue(['interaction_count', 'interactions'])) || 0;
  const inactiveDays = parseFloat(getValue(['inactive_days'])) || 0;
  const stageDurationDays = parseFloat(getValue(['stage_duration_days'])) || 0;
  
  // 2. Weighted Pipeline Forecast
  // Use stage lookup if probability is missing, else use parsed probability
  const lookupProb = STAGE_PROBABILITIES[s] !== undefined ? STAGE_PROBABILITIES[s] * 100 : probability;
  const finalProb = probability > 0 ? probability : lookupProb;
  const weightedValue = value * (finalProb / 100);

  // 3. Momentum Score
  // Formula: (2 * log(1 + interactions)) - (1 * inactive) - (0.5 * duration)
  let momentumScore = (2 * Math.log(1 + interactionCount)) - (1 * inactiveDays) - (0.5 * stageDurationDays);
  // Clip to 0-100
  momentumScore = Math.max(0, Math.min(100, momentumScore));
  const momentumFactor = momentumScore / 100;

  // 4. Slippage Detection
  // If dealDate < today and deal is not closed, it slipped.
  const targetDate = new Date(dealDate);
  const today = new Date();
  const isSlippage = today > targetDate && stage !== DealStage.CLOSED_WON && stage !== DealStage.CLOSED_LOST;

  // 5. AI Probability
  // ai_prob = win_prob × (0.5 + 0.5 × momentum_factor)
  // Apply Slippage Penalty: ai_prob = ai_prob * 0.8
  let aiProbDec = (finalProb / 100) * (0.5 + (0.5 * momentumFactor));
  if (isSlippage) {
    aiProbDec *= 0.8;
  }
  const aiProbability = Math.min(aiProbDec * 100, 100); // Cap at 100%
  const aiWeightedValue = value * aiProbDec;

  // 6. Deal Health (Red / Amber / Green)
  let health: 'green' | 'amber' | 'red' = 'green';
  if (inactiveDays > 30 || stageDurationDays > 60 || (riskLevel === 'high' && inactiveDays > 14)) {
    health = 'red';
  } else if ((inactiveDays >= 14 && inactiveDays <= 30) || (stageDurationDays >= 30 && stageDurationDays <= 60)) {
    health = 'amber';
  }

  return {
    id,
    title,
    companyName: company,
    stage,
    value,
    ownerName,
    probability: finalProb,
    lastContactDate, 
    createdDate,
    nextStep,
    riskLevel,
    contacts: [{ id: `c-${id}`, name: contactName, role: 'Primary', email: '' }],
    activityLogs: [],
    
    // Forecast Data
    dealDate,
    stageDurationDays,
    interactionCount,
    inactiveDays,
    weightedValue,
    momentumScore,
    aiProbability,
    aiWeightedValue,
    health,
    slippage: isSlippage
  };
}