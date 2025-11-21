# Eidosense Visibility X-Ray - AI Agent Context

## 1. Project Overview
**Name:** Montenegro Business Visibility (Eidosense Visibility X-Ray)
**Domain:** Digital Audit & SEO/Visibility Tool for Businesses in Montenegro.
**Core Value Proposition:** A "brutally honest" digital audit tool that compares a user's business against the market leader in their specific city and category using Google Gemini AI.

## 2. Tech Stack
- **Framework:** React 19 (via Vite/Create React App structure).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS (Dark Mode / Cyber-Security Aesthetic).
- **AI Provider:** Google Gemini API (`@google/genai` SDK).
  - **Models:** `gemini-2.5-flash` (for fast mapping and analysis).
  - **Tools:** `googleMaps` (Grounding), `googleSearch` (Grounding).
- **Visualization:** Recharts (Gauge), Google Maps JS API (MapVisualizer).
- **Icons:** Lucide React.

## 3. Core Workflows

### A. The Audit Process (`handleMapSearch`)
1. **Input:** User enters a business name.
2. **AI Search (`services/geminiService.ts` -> `searchBusinessOnMaps`):**
   - The AI is prompted to find the **Target Business** via Google Maps Grounding.
   - **CRITICAL:** The AI is *simultaneously* prompted to find the **Market Leader** (Benchmark Competitor) in the same city and category (Highest Rated/Most Reviewed).
   - **Inference:** Since we do not have access to SEMrush/Ahrefs APIs, the AI uses "heuristic inference" to estimate:
     - `backlinkAuthority`: Based on review count, luxury status, and global fame.
     - `influencerImpact`: Based on photo quality, "vibe," and popularity.
   - **Claim Status Detection:** Logic checks for NAP (Name, Address, Phone) + Website presence to determine if a business is likely claimed (`yes`, `partial`, `no`) and generates `claimStatusNotes`.
3. **State Update:** The app stores both the `Target` and `Benchmark` data in the `AuditMetrics` state.

### B. The Analysis Process (`handleGenerate`)
1. **Scoring:** A deterministic score (0-100) is calculated based on "Hard Metrics" and "Inferred Metrics" (see Section 4).
2. **AI Report Generation (`services/geminiService.ts` -> `generateAIAnalysis`):**
   - **Persona:** "Eidosense Chief Auditor (Dark Growth Strategy)".
   - **Tone:** Intimidating, brutally honest, financially focused (e.g., "Bleeding revenue").
   - **Task:**
     - Deep scan the specific Benchmark Competitor using `googleSearch` grounding.
     - Compare Target vs. Benchmark specifically on **Backlinks** and **Influencer Impact**.
     - Explicitly mention **Lost Traffic Types** (e.g., "High-spending tourists").

## 4. Scoring Algorithm (Total: 100 Points)

The score is calculated in `App.tsx` -> `calculateScore`.

| Metric Category | Max Points | Logic |
| :--- | :--- | :--- |
| **1. Claim Status** | 15 | Yes (+15), Partial (+8) |
| **2. NAP Consistency** | 10 | Consistent Address/Phone (+10) |
| **3. Reviews** | 15 | >50 & >4.4★ (+15), >10 (+8), >0 (+3) |
| **4. Recent Activity** | 5 | Active in last 30 days (+5) |
| **5. Photo Quality** | 5 | Pro (+2), Interior (+1), Exterior (+2) |
| **6. 360° Tour** | 10 | Professional (+10), Basic (+5) |
| **7. Categories** | 5 | Optimized Categories (+5) |
| **8. Competitor Rank** | 10 | Top 3 vs Leader (+10), Top 10 (+5) |
| **9. Backlink Auth** | 10 | High (+10), Medium (+5) |
| **10. Influencer Impact** | 10 | Viral (+10), Moderate (+5) |

## 5. Data Structures (`types.ts`)

### `AuditMetrics`
The central state object. Key fields added for 360 analysis:
- `isClaimed`: 'yes' | 'partial' | 'no'
- `claimStatusNotes`: string (Detailed reason, e.g., "Phone found, owner unclear")
- `backlinkAuthority`: 'High' | 'Medium' | 'Low' (Inferred)
- `influencerImpact`: 'Viral' | 'Moderate' | 'None' (Inferred)
- `benchmark`: `CompetitorData` object containing the Market Leader's details.

## 6. Localization
- Supported Languages: English (`en`), Montenegrin (`me`), Turkish (`tr`).
- Managed in `constants.ts`.
- The AI Prompt in `generateAIAnalysis` dynamically adjusts the output language based on the selected locale.

## 7. Visual Components
- **`ScoreGauge`:** A donut chart visualizing the 0-100 score.
- **`MapVisualizer`:** Renders a Google Map with custom dark styles.
  - **Blue/Purple Marker:** The User (Target).
  - **Red Marker:** The Benchmark (Market Leader).
  - Used to visually demonstrate proximity and dominance gaps.

## 8. Future AI Agent Instructions
If modifying this app, strictly adhere to these rules:
1. **No Fake Data:** Always use the `searchBusinessOnMaps` result. If null, handle gracefully.
2. **Billing:** Never ask for API keys in the UI. Use `process.env.API_KEY`.
3. **Tone:** Maintain the "Cyber-Audit" aesthetic. It is not a friendly marketing tool; it is a diagnostic tool.
4. **360 Focus:** Always emphasize that Google Maps is just the *surface*; the real battle is won via Backlinks and Influencers (even if we infer these metrics).
