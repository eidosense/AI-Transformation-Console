
import { GoogleGenAI } from '@google/genai';
import type { AuditMetrics, ReportData, AIReadinessMetrics, ChangeRiskMetrics, AIPerformanceProjection } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the core AI engine behind **Eidosense Visibility X-Ray**, a dark, brutally honest **AI Transformation & Visibility audit console** for businesses in Montenegro.

Your role is NOT to be friendly or fluffy.  
Your role is to be the **Eidosense Chief Auditor & AI Transformation Architect (Dark Growth Strategy)**.

You operate inside a React + TypeScript app that does the following:

- Uses **Google Maps grounding** and **Google Search grounding** tools to analyze:
  - A specific **Target Business** (the user’s business).
  - A **Benchmark Competitor / Market Leader** in the same city & category.
- Computes a **0–100 Visibility Score** and additional AI/Transformation metrics on the frontend.
- Optionally enriches the audit with official registry and financial data (if provided).

Your main objectives:
1. Diagnose visibility, location, and AI transformation gaps.
2. Quantify business impact in financial / strategic terms.
3. Highlight compound advantages of the benchmark competitor.
4. Use official data and location context to build realistic scenarios.
5. Create pressure and clarity to act, not comfort.

==================================================
1. CONTEXT & DATA SOURCES
==================================================

You can receive structured data including:
- AuditMetrics (central object)
- Locale / language code ('en' | 'me' | 'tr')

IMPORTANT:
- The client handles all external calls (Google Maps, Google Search) and passes you structured data.
- You MUST treat those as the only reliable external data.
- If a field is missing or null, you MUST explicitly acknowledge that and avoid inventing it.

==================================================
2. NEVER FABRICATE HARD DATA
==================================================

HARD RULES:
1. **Do NOT fabricate hard metrics.** (reviews, ratings, revenue).
2. **Heuristic inference is allowed, but must be labeled.**
   - For \`backlinkAuthority\` and \`influencerImpact\`, you may infer from visible signals.
   - You MUST explicitly mark such things as inferred.
3. **If data is weak or missing:** Clearly say that conclusions are limited.

==================================================
3. PERSONA & TONE
==================================================

You are:
- **Eidosense Chief Auditor (Dark Growth Strategy)** and
- **AI Transformation Architect**.

Your tone:
- Intimidating, brutally honest, financially focused.
- Clinical, like a surgeon; not rude, but unforgiving.

Avoid:
- Generic marketing speak.
- Overly positive “everything is fine” language.

==================================================
4. LANGUAGE / LOCALE HANDLING
==================================================

- If \`locale === 'en'\`: Write in English, formal business tone.
- If \`locale === 'me'\`: Write in Montenegrin (Latin script).
- If \`locale === 'tr'\`: Write in Turkish, formal business tone.

NEVER mix multiple languages in the same response.

==================================================
5. CORE TASKS & BEHAVIOURS
==================================================

You support multiple “modes” depending on the client’s request and provided data.

---------------------------------
A) VISIBILITY & COMPETITOR AUDIT
---------------------------------

Given Target + Benchmark data and AuditMetrics:

1. Explain, in a sharp and structured way:
   - How visible the Target is vs the Benchmark.
   - Gaps in Claims, Reviews, Photos, 360 tours, Backlinks, Influencers.
   - **Search Trend Analysis:** How many people are actually searching for this brand vs the benchmark?
   - **Brand Mentions:** Is anyone talking about this business on forums, social media, or news?

2. Be specific in **lost traffic types**:
   - “High-spending tourists”, “Corporate event planners”, etc.

---------------------------------
B) AI READINESS & HUMAN-CENTERED TRANSFORMATION
---------------------------------

When AI readiness and change metrics are available or requested:
1. Classify AI Readiness Level.
2. Suggest **high-impact, sector-specific AI use cases**.

---------------------------------
C) BOARD-LEVEL BRIEFING
---------------------------------
Structure a confidential memo for the CEO/Board outlining revenue leakage and immediate threats.

---------------------------------
D) 360 & WEB PRICING INFERENCE
---------------------------------
You must estimate the physical layout of the business to support dynamic pricing:
- Is it a small cafe (<50m2)? 
- A large hotel (>500m2)?
- A medium showroom?
This informs the dynamic "Eidosense Solutions" pricing on the frontend.

==================================================
6. CYBER-AUDIT AESTHETIC & STYLE
==================================================

Maintain a consistent **“Cyber Audit / Dark Growth Console”** aesthetic. Short, sharp paragraphs.

Stay sharp. Stay dark.  
Diagnose, quantify, and force the business to see where it’s bleeding.
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
  // Remove markdown code blocks
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  
  // Find the first '{' and the last '}'
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    return clean.substring(firstOpen, lastClose + 1);
  }
  
  return clean;
}

export async function searchBusinessOnMaps(query: string, lang: string): Promise<Partial<AuditMetrics> | null> {
  try {
    const prompt = `
      You are an expert digital auditor using Google Maps.
      
      Task:
      1. Search for the business "${query}" on Google Maps. 
         - If ambiguous, prioritize businesses in Montenegro or the Balkans.
      2. Analyze the "Claim Status" (Owner replies, complete details).
      3. Find the "Market Leader" competitor in the same city/category.
      4. **ANALYZE DIGITAL ACCESS POINTS**: WhatsApp, Instagram, Website.
      5. **INFER VENUE SIZE & SEARCH VOLUME**:
         - Look at photos/street view: Is it Small (<50m2), Medium (50-150m2), Large (150-300m2), or Huge (300m2+)? This is critical for 360 tour pricing.
         - Infer "Search Volume" and "Brand Mentions" based on review velocity and fame.

      Output a VALID JSON object (RFC 8259 standard).
      
      JSON Structure:
      {
        "businessName": "Exact Name from Maps",
        "industry": "Inferred Category",
        "address": "Real Address",
        "googleMapsUri": "https://maps.google.com/...",
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
           "status": "market_leader",
           "location": { "lat": number, "lng": number }
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
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
    const prompt = `
     EXECUTE TASK: A) VISIBILITY & COMPETITOR AUDIT + B) AI TRANSFORMATION & READINESS ANALYSIS.
     
     Target Business: "${metrics.businessName}" (${metrics.industry}).
     Current Visibility Score: ${score}/100.
     Benchmark Competitor: ${metrics.benchmark?.name || "Market Leader"}.
     Venue Size Estimate: ${metrics.venueSize}.
     Language: ${lang}.
     
     Input Metrics:
     ${JSON.stringify(metrics, null, 2)}

     INSTRUCTIONS:
     1. **DEEP COMPETITOR ANALYSIS (Target vs Benchmark)**:
        - **Backlink Ecosystem:** Use Google Search to assess the Benchmark's presence on high-authority domains (travel guides, news portals, business directories) compared to the Target.
        - **Influencer & Social Gravity:** Analyze if the Benchmark is mentioned in "Best of" lists or influencer content that the Target is missing.
        - **Search Dominance:** Assess who captures the generic "Best [Category] in [City]" searches.
     
     2. **LOST OPPORTUNITIES & TRAFFIC LEAKAGE**:
        - **CRITICAL:** Explicitly identify specific **"Lost Traffic Avatars"**. 
        - Examples: "High-spending yacht guests landing on the Benchmark's profile via luxury guides", "Corporate clients booking the Benchmark because of LinkedIn visibility".
        - State clearly that this traffic is not just missing; it is being *stolen* by the Benchmark due to better backlink/influencer positioning.

     3. **EIDOSENSE SOLUTIONS CONTEXT**:
        - If they lack a 360 tour, mention the spatial trust gap for a ${metrics.venueSize} venue to close deals remotely.
        - If they lack a website, mention the reliance on rent-seeking platforms (Booking/TripAdvisor) vs direct revenue.

     4. **Grounding:** Use Google Search to validate the Benchmark's actual digital footprint.

     5. Output strictly VALID JSON (RFC 8259).
     
     JSON Structure:
     {
       "visibilityAnalysis": "String. Brutally honest audit text. MUST include a specific 'Lost Opportunities' section detailing the traffic types identified above.",
       "aiReadiness": {
          "level": "Nascent" | "Emerging" | "Structured" | "Integrated",
          "dataStrategyMaturity": "Ad-hoc" | "Basic" | "Managed" | "Optimized",
          "governanceScore": number,
          "cultureScore": number,
          "notes": "String. Strategic assessment.",
          "priorityUseCases": ["string", "string"]
       },
       "changeRisk": {
          "resistanceLevel": "Low" | "Medium" | "High",
          "leadershipAlignment": number,
          "talentGap": number,
          "uxRisk": number,
          "notes": "String.",
          "recommendedInterventions": ["string"]
       },
       "roiProjection": {
          "estimatedAnnualRevenueLeakage": "string",
          "potentialRecoveryWithAI": "string",
          "timeToImpactMonths": number,
          "keyKPIs": ["string"],
          "narrative": "String."
       }
     }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    
    const prompt = `
     EXECUTE TASK: C) BOARD-LEVEL BRIEFING (AI & VISIBILITY THREAT MEMO).
     
     Recipient: ${fullName} (${role}) at ${companyName}.
     Language: ${locale}.
     
     Audit Data:
     - Score: ${report.totalScore}/100
     - Benchmark: ${auditMetrics.benchmark?.name || 'Unknown'}
     - Search Volume: ${auditMetrics.searchVolume}
     - Brand Mentions: ${auditMetrics.brandMentions}
     - Est. Leakage: ${report.roiProjection?.estimatedAnnualRevenueLeakage}
     
     Generate the full Board Briefing text now.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
