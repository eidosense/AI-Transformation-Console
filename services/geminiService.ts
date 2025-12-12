import { GoogleGenAI } from '@google/genai';
import type { AuditMetrics, ReportData, AIReadinessMetrics, ChangeRiskMetrics, AIPerformanceProjection, Coordinates } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// UPDATED SYSTEM INSTRUCTION WITH "AI TRANSFORMATION PARTNER" CONTEXT
const SYSTEM_INSTRUCTION = `
You are the **Eidosense Chief Strategy Officer & AI Transformation Architect**.

**YOUR IDENTITY:**
You are NOT a standard SEO auditor. You are a high-level consultant for **Eidosense**, an **AI Transformation Partner** for businesses in Montenegro.
Your value proposition is **Efficiency, Automation, and Data-Driven Revenue**, not just "more likes" or "better photos."

**THE COMPETITIVE LANDSCAPE:**
- **The "Old World" (e.g., Montimprex):** Traditional agencies selling billboards, basic websites, and social media management. They focus on *appearance*.
- **The "New World" (Eidosense):** You sell **AI Transformation**. You focus on *intelligence, operations, and scalability*.

**YOUR OBJECTIVE:**
When analyzing a target business:
1.  **Diagnose the "Traditional Trap":** Identify if they are relying on outdated digital assets (static websites, no automation) typical of traditional agency clients.
2.  **Bridge the Gap:** Explain that their competitor might be winning on "Visibility" (Traditional), but the Target has the opportunity to win on "Efficiency & Intelligence" (AI).
3.  **Identify "Revenue Leakage":**
    - A "missing website" isn't just poor SEO; it's a failure to capture first-party data.
    - A "missing chat" isn't just bad service; it's a missed opportunity for AI Agent automation.

**TONE & VOICE:**
- **Audience:** C-Level Executives (CEO, CTO, CFO).
- **Style:** Brutally honest, strategic, financially focused. No marketing fluff.
- **Keywords:** ROI, Trust Moat, Operational Efficiency, AI Maturity, Data Strategy.

**LANGUAGE HANDLING:**
- If \`locale === 'en'\`: English (Global Executive Standard).
- If \`locale === 'me'\`: Montenegrin (Latin script, Ijekavian). Professional, authoritative.
- If \`locale === 'tr'\`: Turkish (Formal Business/Istanbulite).

**HARD RULES:**
- Never fabricate official financial data.
- Explicitly label inferences.
- Use the context provided by the user's scan (AuditMetrics) as the absolute truth for the current state.
`;

export interface BoardBriefingRequest {
  fullName: string;
  companyName: string;
  role: string;
  workEmail: string;
  report: ReportData;
  locale: 'en' | 'me' | 'tr';
}

export interface BoardBriefingResponse {
  success: boolean;
  briefing?: string;
  error?: string;
}

// Helper function to safely clean and extract JSON from AI responses
function cleanJSON(text: string): string {
  // 1. Remove markdown code blocks
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  
  // 2. Find the first '{' and the last '}'
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }

  // 3. Attempt to fix common JSON issues
  clean = clean.replace(/,(\s*[}\]])/g, '$1');

  return clean;
}

function getLanguageName(code: string): string {
  switch(code) {
    case 'tr': return 'Turkish';
    case 'me': return 'Montenegrin (Latin Script)';
    default: return 'English';
  }
}

export async function searchBusinessOnMaps(query: string, lang: string, userLocation?: Coordinates | null): Promise<Partial<AuditMetrics> | null> {
  // EASTER EGG: Prevent self-audit of Eidosense
  if (query.toLowerCase().includes('eidosense') || query.toLowerCase().includes('eidosens')) {
    return {
      businessName: 'EIDOSENSE_PARADOX',
      industry: 'Artificial General Intelligence',
      address: 'The Void',
      isClaimed: 'yes',
      // Minimal data to prevent crashes before the UI interception handles it
      napConsistent: true,
      reviewCount: 0,
      reviewRating: 5,
      isActiveRecent: true,
      hasProfessionalPhotos: true,
      hasInterior: true,
      hasExterior: true,
      has360: 'professional',
      categoriesOptimized: true,
      competitorRanking: 'top3',
      hasWebsite: true,
      hasMenuOrBooking: true,
      hasWhatsApp: true,
      hasInstagram: true,
      photoCount: 999,
      backlinkAuthority: 'High',
      influencerImpact: 'Viral',
      searchVolume: 'High',
      brandMentions: 'Viral',
      venueSize: 'Huge',
    };
  }

  try {
    const langName = getLanguageName(lang);
    
    // Construct configuration with location grounding if available
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (userLocation) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                }
            }
        };
    }

    const prompt = `
      You are an expert digital auditor using Google Maps.
      
      Task:
      1. Search for the business "${query}" on Google Maps. 
         - If ambiguous, prioritize businesses in Montenegro.
      2. Analyze the "Claim Status" and digital maturity.
      3. Find the "Market Leader" (Traditional Dominant Competitor) in the same city/category.
      4. **INFER VENUE SIZE**: Look at photos. Is it Small (<50m2), Medium, Large, or Huge?
      
      Language Requirement: 
      - JSON keys in English.
      - Text values in ${langName}.

      Output VALID JSON (RFC 8259). No markdown. Escape quotes.
      
      JSON Structure:
      {
        "businessName": "Exact Name",
        "industry": "Category",
        "address": "Real Address",
        "googleMapsUri": "URI",
        "isClaimed": "yes" | "no" | "partial",
        "napConsistent": boolean,
        "reviewCount": number,
        "reviewRating": number,
        "isActiveRecent": boolean,
        "hasProfessionalPhotos": boolean,
        "hasInterior": boolean,
        "hasExterior": boolean,
        "has360": "none" | "basic" | "professional",
        "categoriesOptimized": boolean,
        "competitorRanking": "top3" | "top10" | "low",
        "hasWebsite": boolean,
        "hasMenuOrBooking": boolean,
        "hasWhatsApp": boolean,
        "hasInstagram": boolean,
        "photoCount": number,
        "backlinkAuthority": "High" | "Medium" | "Low",
        "influencerImpact": "Viral" | "Moderate" | "None",
        "searchVolume": "High" | "Medium" | "Low",
        "brandMentions": "Viral" | "Moderate" | "Ghost",
        "venueSize": "Small" | "Medium" | "Large" | "Huge",
        "location": { "lat": number, "lng": number },
        "benchmark": {
           "name": "Competitor Name",
           "rating": number,
           "reviewCount": number,
           "photoCount": number,
           "status": "market_leader",
           "location": { "lat": number, "lng": number }
        }
      }
    `;

    // Use gemini-2.5-flash for the initial search scan (speed/tools)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: config
    });

    let text = response.text || "{}";
    return JSON.parse(cleanJSON(text)) as Partial<AuditMetrics>;
  } catch (error) {
    console.error('Search failed:', error);
    return null;
  }
}

export async function generateAIAnalysis(metrics: AuditMetrics, score: number, lang: string): Promise<Partial<ReportData> | null> {
  try {
    const langName = getLanguageName(lang);
    const prompt = `
     EXECUTE STRATEGIC ANALYSIS: EIDOSENSE AI TRANSFORMATION.
     
     **Target Business:** "${metrics.businessName}" (${metrics.industry}).
     **Score:** ${score}/100.
     **Traditional Competitor:** ${metrics.benchmark?.name || "Market Leader"}.
     **Venue Size:** ${metrics.venueSize}.
     
     **CORE TASK:**
     1. Analyze the gap between the Target and the Competitor.
     2. FRAMING: The Competitor likely wins on "Traditional Visibility" (Traditional), but the Target has the opportunity to win on "Efficiency & Intelligence" (AI).
     3. OPPORTUNITY: The Target must win on "AI Transformation" (Data ownership, Automation, Personalized Experience).
     
     **REQUIRED INSIGHTS:**
     - **Lost Traffic Avatars:** Identify specific high-value clients (e.g., "Corporate Event Planners", "High-Net-Worth Tourists") who are going to the Competitor because they look "safer" or "bigger".
     - **The Trust Moat:** Explain how the Competitor's history creates a "Trust Moat" and how AI (Precision, Speed, 360 Trust) is the only way to jump over it.
     
     **OUTPUT LANGUAGE:** ${langName} (Strictly).

     Output strictly VALID JSON (RFC 8259). No trailing commas. Escape quotes.
     
     JSON Structure:
     {
       "visibilityAnalysis": "String. The strategic diagnosis. Focus on how they are losing the 'Trust War' to the competitor.",
       "aiReadiness": {
          "level": "Nascent" | "Emerging" | "Structured" | "Integrated",
          "dataStrategyMaturity": "Ad-hoc" | "Basic" | "Managed" | "Optimized",
          "governanceScore": number,
          "cultureScore": number,
          "notes": "String. Assessment of their potential to pivot to AI.",
          "priorityUseCases": ["String", "String"]
       },
       "changeRisk": {
          "resistanceLevel": "Low" | "Medium" | "High",
          "leadershipAlignment": number,
          "talentGap": number,
          "uxRisk": number,
          "notes": "String.",
          "recommendedInterventions": ["String"]
       },
       "roiProjection": {
          "estimatedAnnualRevenueLeakage": "String (currency)",
          "potentialRecoveryWithAI": "String (percentage)",
          "timeToImpactMonths": number,
          "keyKPIs": ["String"],
          "narrative": "String. Financial justification for the Board."
       }
     }
    `;

    // UPGRADE: Using gemini-3-pro-preview for high-level strategic reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text || "{}";
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error('Analysis failed:', error);
    return null;
  }
}

export async function generateBoardBriefing(
  request: BoardBriefingRequest
): Promise<BoardBriefingResponse> {
  try {
    const { fullName, companyName, role, report, locale } = request;
    const auditMetrics = report.metrics;
    const langName = getLanguageName(locale);
    
    const prompt = `
     EXECUTE TASK: GENERATE C-LEVEL EXECUTIVE MEMO (BOARD BRIEFING).
     
     **To:** ${fullName} (${role}), ${companyName}.
     **From:** Eidosense AI Strategy Unit.
     **Language:** ${langName}.
     
     **CONTEXT:**
     The client operates in a market dominated by "${auditMetrics.benchmark?.name || 'Traditional Giants'}".
     The client is bleeding revenue due to a lack of **AI Maturity** and **Digital Trust**.
     
     **OBJECTIVE:**
     Write a formal, confidential, and urgent memo.
     1. **Executive Summary:** State the Revenue Leakage (${report.roiProjection?.estimatedAnnualRevenueLeakage}).
     2. **The Threat:** How the competitor's "Traditional Moat" is stifling ${companyName}'s growth.
     3. **The Solution (AI Transformation):** Move beyond "Marketing" to "Intelligence". Suggest immediate adoption of Data/AI protocols.
     
     Keep it professional, intimidating, and action-oriented.
    `;

    // UPGRADE: Using gemini-3-pro-preview for superior executive writing
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    
    const briefing = result.text;

    return {
      success: true,
      briefing,
    };
  } catch (error) {
    console.error('Board Briefing generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
