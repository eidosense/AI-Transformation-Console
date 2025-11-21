# Eidosense Visibility X-Ray — Montenegro Business Visibility & AI Transformation Console

**Version:** 2.5.1 (Legal/Liability Update)  
**Domain:** Digital Audit, AI Transformation, Strategic Intelligence  
**Region:** Montenegro (Primary), Balkans (Secondary)

---

## 1. Overview

### 1.1 Concept
**Eidosense Visibility X-Ray** is a "brutally honest" digital audit console designed for businesses in Montenegro. Unlike standard SEO tools that offer generic advice, Eidosense acts as a **strategic diagnostic engine**. It compares a specific target business against the **Market Leader (Benchmark)** in the same city and category, revealing not just "errors" but **revenue leakage** and **dominance gaps**.

### 1.2 Core Value Proposition
The application transforms fragmented digital signals—Google Maps data, reviews, visual aesthetics, and (in advanced tiers) official financial/registry data—into a coherent **Board-Level Threat Assessment**.

It answers three critical questions for the user:
1. **Are you visible?** (Or is the market leader stealing your traffic?)
2. **Are you credible?** (Do you look like a modern business or a relic?)
3. **How much is this costing you?** (Financial framing of digital incompetence).

### 1.3 AI Persona & Tone
The AI engine behind the console is the **"Eidosense Chief Auditor & AI Transformation Architect (Dark Growth Strategy)"**.

*   **Tone:** Intimidating, clinical, brutally honest, financially focused.
*   **Style:** "Dark Mode" consulting. No emojis, no "Good job!", no marketing fluff.
*   **Objective:** Diagnose pathology in the business's digital body and prescribe surgery (transformation).

---

## 2. Tech Stack & Architecture

### 2.1 Frontend
*   **Framework:** React 19 (Vite / Create React App structure).
*   **Language:** TypeScript.
*   **Styling:** Tailwind CSS.
    *   *Aesthetic:* Dark Mode, Cyber-Security, "HUD" interfaces, Neon accents (Cyan/Red).
*   **Icons:** Lucide React.

### 2.2 AI & Intelligence Layer
*   **Provider:** Google Gemini API (`@google/genai`).
*   **Model:** `gemini-2.5-flash` (optimized for low latency and grounding).
*   **Tools:**
    *   `googleMaps`: For grounding business data and finding competitors.
    *   `googleSearch`: For grounding brand mentions, news, and broader context.

### 2.3 Visualization
*   **Recharts:** Custom "Score Gauge" (0-100) visualization.
*   **MapVisualizer:** A custom React component using relative coordinate mathematics to render a "Radar" view of the Target vs. Benchmark, bypassing the need for a paid Google Maps Visual SDK in the frontend.

---

## 3. Data Model (TypeScript Sketch)

The application relies on a strict schema to maintain state consistency between the "Live Scan" (Maps data) and the "AI Analysis" (Report).

### 3.1 Central State: `AuditMetrics`
```typescript
export interface AuditMetrics {
  // Identity
  businessName: string;
  industry: string;
  location?: { lat: number; lng: number };
  address?: string;
  googleMapsUri?: string; // Link to real listing

  // 1. Claim & Basics
  isClaimed: 'yes' | 'partial' | 'no';
  claimStatusNotes?: string; // AI reasoning for claim status
  napConsistent: boolean; // Name, Address, Phone consistency

  // 2. Social Proof
  reviewCount: number;
  reviewRating: number;
  isActiveRecent: boolean; // Reviews in last 30 days?

  // 3. Visual Assets
  hasProfessionalPhotos: boolean;
  hasInterior: boolean;
  hasExterior: boolean;
  photoCount: number;
  has360: 'professional' | 'basic' | 'none'; // Critical for pricing logic

  // 4. SEO & Competitor
  categoriesOptimized: boolean;
  competitorRanking: 'top3' | 'top10' | 'low';
  benchmark?: CompetitorData; // The Market Leader's data

  // 5. Digital Access Points (CTA)
  hasWebsite: boolean;
  hasMenuOrBooking: boolean;
  hasWhatsApp: boolean;
  hasInstagram: boolean;

  // 6. Inferred Metrics (Heuristic/AI Estimated)
  backlinkAuthority: 'High' | 'Medium' | 'Low';
  influencerImpact: 'Viral' | 'Moderate' | 'None';
  searchVolume: 'High' | 'Medium' | 'Low'; // Search demand
  brandMentions: 'Viral' | 'Moderate' | 'Ghost'; // Social listening
  venueSize: 'Small' | 'Medium' | 'Large' | 'Huge'; // For 360 pricing
}
```

### 3.2 Official Data Layer (Advanced/Paid Tiers)
*These structures support backend integration for Pro reports.*

```typescript
interface OfficialRegistryData {
  pib: string; // Tax ID
  registrationNumber: string;
  legalName: string;
  activityCode: string;
  municipality: string;
  registrationDate: string;
}

interface OfficialFinancials {
  currency: 'EUR';
  annualRevenue: Array<{ year: number; amount: number }>;
  netProfit: Array<{ year: number; amount: number }>;
  trend: 'Growing' | 'Flat' | 'Declining';
}

interface LocationDemographics {
  municipality: string;
  neighborhoodType: 'TouristCore' | 'Business' | 'Residential' | 'Rural';
  wealthLevel: 'High' | 'UpperMid' | 'Mid' | 'Low';
  touristIntensity: 'High' | 'Seasonal' | 'Low';
}
```

### 3.3 Board Briefing
```typescript
interface BoardBriefingFormData {
  fullName: string;
  companyName: string;
  role: string; // e.g. CEO, CFO
  workEmail: string; // Free emails blocked
}
```

---

## 4. Core Workflows & Scoring

### 4.1 Map Search & Audit (`handleMapSearch`)
1.  **Input:** User scans a business name.
2.  **Discovery:** AI uses `googleMaps` tool to locate the Target.
3.  **Benchmark Identification:** AI *simultaneously* searches for the "Best rated [category] in [city]" to establish a Benchmark.
4.  **Inference:** AI estimates non-visible metrics (Venue Size, Brand Mentions) based on photos and review velocity.
5.  **Liability Check:** If specific assets (Instagram) are not found via standard crawling, they are marked "Not Detected" with a strict liability disclaimer.

### 4.2 Scoring Algorithm (Total: 100 Points)
A deterministic logic to ensure fairness.

| Metric | Pts | Logic |
| :--- | :--- | :--- |
| **Claim Status** | 15 | Verified ownership (+15), Partial (+8) |
| **Reviews** | 15 | >50 & >4.4★ (+15), >10 (+8), >0 (+3) |
| **NAP Consistency** | 10 | Consistent Name/Address/Phone across web |
| **Competitor Rank** | 10 | Top 3 vs Leader (+10), Top 10 (+5) |
| **360° Tour** | 10 | Professional (+10), Basic (+5) |
| **Backlink Auth** | 10 | High (+10), Medium (+5) (Inferred) |
| **Influencer Impact** | 10 | Viral (+10), Moderate (+5) (Inferred) |
| **Photo Quality** | 5 | Pro/Interior/Exterior mix |
| **Categories** | 5 | Optimized GMB Categories |
| **Activity** | 5 | Recent reviews/posts (30 days) |
| **Website & CTA** | 5 | Site, WhatsApp, Menu/Booking presence |

### 4.3 Strategic Analysis (`handleGenerate`)
1.  **Prompting:** The frontend sends `AuditMetrics` + `Language` (`en`|`me`|`tr`) to Gemini.
2.  **Persona Activation:** Gemini adopts the "Dark Auditor" persona.
3.  **Output:**
    *   **Visibility Analysis:** Brutal comparison vs Benchmark.
    *   **AI Readiness:** Assessment of data maturity and culture.
    *   **Change Risk:** Assessment of human resistance to transformation.
    *   **ROI Projection:** Estimated revenue leakage and recovery potential.

### 4.4 Board Briefing Generation (Paid Feature)
1.  **Gatekeeping:** User provides work email/role via Modal.
2.  **Generation:** Gemini generates a text-heavy, formal executive memo addressed to the Board/CEO.
3.  **Content:** Focuses purely on financial risk, market share erosion, and immediate "Stop the Bleeding" actions.

---

## 5. Official Data & Location Layer (Context)

*Note: This section describes the advanced context capability.*

To provide realistic "No-AI vs AI Transformation" scenarios, the system is designed to ingest **Official Registry (CRPS)** and **Financial Data**.

### 5.1 Usage of Official Data
*   **Trend Analysis:** If revenue has been flat for 3 years while the benchmark grew, the AI highlights this divergence.
*   **Scenario Modeling:**
    *   *No-AI Scenario:* Extrapolates the current flat/declining trend.
    *   *AI Scenario:* Applies a sector-specific uplift coefficient (e.g., +15-25% for Hospitality) to the official revenue baseline.

### 5.2 Location Context
*   **Wealth & Demographics:** The AI adapts recommendations based on the neighborhood (e.g., "High-spending tourist zone" requires different tactics than "Residential suburb").

---

## 6. AI Agent Behaviour & Constraints

### 6.1 Strict Constraints
1.  **No Fabrication:** The AI must **NEVER** invent official registry numbers (PIB, Reg No) or specific revenue figures if they are not provided in the input context.
2.  **Inference labeling:** When estimating `Backlink Authority` or `Venue Size`, the AI must rely on visual heuristics (from Street View/Photos) and label them as estimates.
3.  **One Language:** Responses must be strictly in the requested locale (`en`, `me`, or `tr`).

### 6.2 Core Tasks
1.  **Gap Analysis:** relentlessly compare Target vs Benchmark.
2.  **Venue Sizing:** Estimate m² (Small/Medium/Large) to drive the **Dynamic Pricing** of 360° Tour packages on the frontend.
3.  **Traffic Avatar Identification:** Identify *who* is being lost (e.g., "High-net-worth yacht guests", "Digital nomads").

---

## 7. Commercial Model

*   **Free Tier:** Basic Scan, Score (0-100), limited "teasers" of analysis.
*   **Pro Audit (One-Time):** Full "Dark" Report, AI Readiness Assessment, Board Briefing generation.
*   **Growth Console (Subscription):** Monthly re-scans, official data integration, competitor tracking over time.
*   **Service Upsells:**
    *   **360° Digital Twins:** Priced dynamically based on venue size.
    *   **Web Transformation:** Next.js sites for conversion.
    *   **Market Dominance:** SEO/Ads management.

---

## 8. Usage of This Document

This document serves as the **canonical reference** for:
*   **Developers:** To understand the data flow between Maps, State, and AI.
*   **Prompt Engineers:** To align Gemini's persona with the "Dark Growth Strategy" brand.
*   **Product Teams:** To design new features that align with the "Audit/Diagnostic" philosophy rather than generic marketing tools.
