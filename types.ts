

export enum Language {
  EN = 'en',
  ME = 'me',
  TR = 'tr',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CompetitorData {
  name: string;
  rating: number;
  reviewCount: number;
  status: 'market_leader' | 'contender';
  location?: Coordinates;
  photoCount?: number;
}

// --- NEW AI TRANSFORMATION TYPES ---

export type AIReadinessLevel = 'Nascent' | 'Emerging' | 'Structured' | 'Integrated';

export interface AIReadinessMetrics {
  level: AIReadinessLevel;
  dataStrategyMaturity: 'Ad-hoc' | 'Basic' | 'Managed' | 'Optimized';
  governanceScore: number; // 0 - 100
  cultureScore: number;    // 0 - 100 (human-AI collaboration)
  notes: string;           // Brutally honest summary
  priorityUseCases: string[]; // Gemini inferred
}

export interface ChangeRiskMetrics {
  resistanceLevel: 'Low' | 'Medium' | 'High';
  leadershipAlignment: number; // 0-100
  talentGap: number;           // 0-100 (higher = worse)
  uxRisk: number;              // 0-100 (AI harming CX / trust)
  notes: string;
  recommendedInterventions: string[];
}

export interface AIPerformanceProjection {
  estimatedAnnualRevenueLeakage: string; // formatted currency
  potentialRecoveryWithAI: string;       // percentage or currency
  timeToImpactMonths: number;
  keyKPIs: string[];
  narrative: string;
}

export interface AuditMetrics {
  businessName: string;
  industry: string;
  // 1. Claim Status (0-15)
  isClaimed: 'yes' | 'partial' | 'no';
  claimStatusNotes?: string;
  // 2. NAP Consistency (0-10)
  napConsistent: boolean;
  // 3. Reviews (0-15)
  reviewCount: number;
  reviewRating: number;
  // 4. Activity 30 Days (0-10)
  isActiveRecent: boolean;
  // 5. Photo Quality (0-10)
  hasProfessionalPhotos: boolean;
  hasInterior: boolean;
  hasExterior: boolean;
  // 6. 360/Street View (0-10)
  has360: 'professional' | 'basic' | 'none';
  // 7. SEO Categories (0-5)
  categoriesOptimized: boolean;
  // 8. Competitor Comparison (0-10)
  competitorRanking: 'top3' | 'top10' | 'low';
  // 9. Website & CTA (0-5)
  hasWebsite: boolean;
  hasMenuOrBooking: boolean;
  hasWhatsApp: boolean;
  hasInstagram: boolean;
  // 10. Photo Count (0-10)
  photoCount: number;
  
  // --- NEW 360 METRICS ---
  // 11. Digital Authority (Backlinks/SEO)
  backlinkAuthority: 'High' | 'Medium' | 'Low';
  // 12. Social Proof (Influencers)
  influencerImpact: 'Viral' | 'Moderate' | 'None';

  // --- NEW SEARCH & VENUE METRICS ---
  searchVolume: 'High' | 'Medium' | 'Low'; // How often people search for this specific brand
  brandMentions: 'Viral' | 'Moderate' | 'Ghost'; // Social listening: are people talking about it?
  venueSize: 'Small' | 'Medium' | 'Large' | 'Huge'; // Inferred size for 360 pricing (<50m, 50-150m, 150-300m, 300m+)

  // Live Benchmark Data
  benchmark?: CompetitorData;
  // Location Data for Map
  location?: Coordinates;
  address?: string;
  googleMapsUri?: string; // Link to real map listing
}

export interface ReportData {
  metrics: AuditMetrics;
  totalScore: number;
  level: 'Invisible' | 'Weak' | 'Visible' | 'Highly Visible';
  
  // Transformation Data (Parsed from AI)
  visibilityAnalysis: string; 
  aiReadiness: AIReadinessMetrics;
  changeRisk: ChangeRiskMetrics;
  roiProjection: AIPerformanceProjection;

  generatedAt: string;
}
export interface BoardBriefingFormData {
  fullName: string;
  companyName: string;
  role: string;
  workEmail: string;
}

export interface BoardBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditMetrics: AuditMetrics;
  locale: 'en' | 'me' | 'tr';
  onGenerate: (formData: BoardBriefingFormData) => void;
}

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
  locale: 'en' | 'me' | 'tr';
}

export type TranslationKey = 
  | 'title' | 'subtitle' | 'startAudit' | 'businessDetails' 
  | 'score' | 'findings' | 'opportunities' | 'solutions' 
  | 'contact' | 'packages' | 'generateReport' | 'analyzing'
  | 'critical' | 'good' | 'reportTitle' | 'benchmark' | 'competitors';

export interface Package {
  name: string;
  price?: string; // Made optional as we are moving to inquiry model
  billingPeriod: 'one-time' | 'monthly' | 'annual';
  features: string[];
  recommended?: boolean;
  highlight?: string;
}