import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Share2, LayoutDashboard, Search, ChevronRight, AlertOctagon, MapPin, Zap, TrendingUp, Target, Lock, Globe, Link as LinkIcon, Megaphone, Brain, Database, Users, ShieldAlert, Briefcase, ArrowUpRight, BarChart3, PieChart, FileText, Copy, X, ExternalLink, Phone, Instagram, MessageCircle, Box, Scale } from 'lucide-react';
import { generateAIAnalysis, searchBusinessOnMaps, generateBoardBriefing } from './services/geminiService';
import { Language, AuditMetrics, ReportData, Package, BoardBriefingFormData, Coordinates } from './types';
import { TRANSLATIONS, INITIAL_METRICS, LEVEL_TRANSLATIONS } from './constants';
import ScoreGauge from './components/ScoreGauge';
import MapVisualizer from './components/MapVisualizer';
import { BoardBriefingModal } from './components/BoardBriefingModal';
import { ContactModal } from './components/ContactModal';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.EN);
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics>(INITIAL_METRICS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [report, setReport] = useState<ReportData | null>(null);
  const [view, setView] = useState<'audit' | 'report'>('audit');
  const [activeTab, setActiveTab] = useState<'visibility' | 'ai-readiness' | 'change' | 'roi'>('visibility');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  
  // Briefing Modal State
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingContent, setBriefingContent] = useState<string | null>(null);

  // Contact/Plan Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const t = TRANSLATIONS[lang];
  
  // LIVE TRACKING: Get Geolocation on Mount
  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  console.log("Live Tracking Active:", position.coords);
                  setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  });
              },
              (err) => console.warn("Geolocation access denied or failed.", err),
              { enableHighAccuracy: true }
          );
      }
  }, []);

  // --- DYNAMIC PACKAGE GENERATION ---
  const getDynamicPackages = (metrics: AuditMetrics, lang: Language): Package[] => {
     const packages: Package[] = [];

     // 1. BASE PACKAGE (Always needed if unclaimed or bad NAP)
     if (metrics.isClaimed !== 'yes' || metrics.napConsistent === false) {
         const titles = {
             en: "Survival Kit", me: "Paket za Opstanak", tr: "Hayatta Kalma Kiti"
         };
         const features = {
             en: ["Google Business Claim", "NAP Cleaning", "Stop Being Invisible"],
             me: ["Verifikacija Vlasništva (GMB)", "Usklađivanje Podataka (NAP)", "Izlazak iz Digitalnog Mraka"],
             tr: ["Google Harita Sahiplenme", "Veri Temizliği", "Görünmezlikten Kurtul"]
         };
         packages.push({
             name: titles[lang],
             price: "€49",
             features: features[lang]
         });
     }

     // 2. 360 TOUR (Based on Venue Size)
     if (metrics.has360 !== 'professional') {
        let price = "";
        let m2Text = "";
        let venueSizeME = metrics.venueSize as string;

        if (lang === 'me') {
            venueSizeME = {
                'Small': 'Mali (<50m²)',
                'Medium': 'Srednji (50-150m²)',
                'Large': 'Veliki (150-300m²)',
                'Huge': 'XXL (300m²+)'
            }[metrics.venueSize] || metrics.venueSize;
        }
        
        // Pricing Logic based on inferred venue size
        if (metrics.venueSize === 'Small') {
            price = "€150"; // Flat rate for small
            m2Text = lang === 'tr' ? "< 50m² Stüdyo" : "< 50m² Studio";
        } else if (metrics.venueSize === 'Medium') {
            price = "€350"; // Flat rate for medium
            m2Text = lang === 'tr' ? "50-150m² Mağaza/Restoran" : "50-150m² Shop/Restaurant";
        } else if (metrics.venueSize === 'Large') {
            price = lang === 'tr' ? "€2.00/m²" : "€2.00/m²"; // Per sqm
            m2Text = lang === 'tr' ? "150m²+ Otel/Showroom" : "150m²+ Hotel/Showroom";
        } else {
            price = lang === 'tr' ? "Özel Teklif" : "Custom Quote";
            m2Text = lang === 'tr' ? "Devasa Alanlar" : "Huge Venues";
        }

        const titles = {
            en: "360° Digital Twin", me: "360° Digitalni Blizanac", tr: "360° Dijital İkiz"
        };
        const features = {
            en: ["Google Street View Trusted", `Pricing for ${metrics.venueSize} Venue`, "VR Hosting Included", "Conversion Boost (+30%)"],
            me: ["Google Street View Sertifikat", `Cijena za: ${venueSizeME}`, "Uključen VR Hosting", "Rast Konverzije (+30%)"],
            tr: ["Google Street View Onaylı", `${m2Text} İçin Fiyat`, "VR Barındırma Dahil", "Dönüşüm Artışı (+30%)"]
        };

        packages.push({
            name: titles[lang],
            price: price,
            highlight: lang === 'tr' ? `m² Bazlı Teklif (${metrics.venueSize})` : (lang === 'me' ? `Ponuda za prostor: ${venueSizeME}` : `${metrics.venueSize} Venue Pricing`),
            recommended: true,
            features: features[lang]
        });
     }

     // 3. VISUAL IDENTITY (New - for missing professional photos)
     if (!metrics.hasProfessionalPhotos || metrics.photoCount < 10) {
         const titles = {
             en: "Visual Identity Pack", me: "Vizuelni Identitet", tr: "Görsel Kimlik Paketi"
         };
         const features = {
             en: ["Professional Photo Session", "Food/Interior Styling", "Google Maps Optimization", "15 High-Res Edits"],
             me: ["Profesionalno Fotografisanje", "Stilizovanje Hrane/Enterijera", "Optimizacija za Google Mape", "15 Obrađenih Fotografija"],
             tr: ["Profesyonel Fotoğraf Çekimi", "Yemek/İç Mekan Stili", "Google Harita Optimizasyonu", "15 Yüksek Çözünürlüklü Düzenleme"]
         };
         packages.push({
             name: titles[lang],
             price: "€250",
             features: features[lang]
         });
     }

     // 4. WEBSITE / DIGITAL PRESENCE
     if (!metrics.hasWebsite) {
         const titles = {
             en: "Web Transformation", me: "Web Transformacija", tr: "Web Dönüşümü"
         };
         const features = {
             en: ["High-Performance Next.js Site", "Direct Booking Engine", "SEO Foundation", "Mobile-First"],
             me: ["High-Performance Sajt (Next.js)", "Sistem za Rezervacije", "SEO Optimizacija", "Mobile-First Dizajn"],
             tr: ["Yüksek Performanslı Web Sitesi", "Direkt Rezervasyon Motoru", "SEO Temeli", "Mobil Öncelikli"]
         };
         packages.push({
            name: titles[lang],
            price: "€990",
            features: features[lang]
         });
     }

     // 5. SOCIAL & ADS (New - if website exists but social is weak)
     if (metrics.hasWebsite && (!metrics.hasInstagram || !metrics.hasWhatsApp)) {
        const titles = {
             en: "Social Accelerator", me: "Social Accelerator", tr: "Sosyal Hızlandırıcı"
         };
         const features = {
             en: ["Instagram/Meta Business Setup", "WhatsApp Integration", "First Month Content Plan", "Ad Account Setup"],
             me: ["Instagram/Meta Podešavanje", "WhatsApp Integracija", "Plan Sadržaja (1. Mjesec)", "Podešavanje Reklama"],
             tr: ["Instagram/Meta Kurulumu", "WhatsApp Entegrasyonu", "İlk Ay İçerik Planı", "Reklam Hesabı Kurulumu"]
         };
         packages.push({
            name: titles[lang],
            price: "€299",
            features: features[lang]
         });
     }

     // 6. MARKET DOMINANCE (Always available as upsell)
     const domTitles = {
         en: "Market Dominator", me: "Tržišna Dominacija", tr: "Pazar Hükümdarı"
     };
     const domFeatures = {
         en: ["Aggressive Ad Ops", "Reputation Defense", "Influencer Outreach", "Full SEO & Backlink Strategy"],
         me: ["Agresivno Oglašavanje (Ads)", "Upravljanje Reputacijom", "Influenser Marketing", "Sveobuhvatna SEO Strategija"],
         tr: ["Agresif Reklam Yönetimi", "İtibar Savunması", "Influencer Ağı Erişimi", "Tam SEO ve Backlink Hakimiyeti"]
     };
     packages.push({
         name: domTitles[lang],
         price: "€349/mo",
         features: domFeatures[lang]
     });

     return packages;
  };

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchStatus('idle');
    setAuditMetrics(INITIAL_METRICS); 
    
    // Pass userLocation to enable Live Tracking / Geolocation biased search
    const result = await searchBusinessOnMaps(searchQuery, lang, userLocation);
    
    if (result) {
      setAuditMetrics(prev => ({ ...prev, ...result }));
      setSearchStatus('success');
    } else {
      setSearchStatus('error');
    }
    
    setIsSearching(false);
  };

  const calculateScore = (m: AuditMetrics): number => {
    let score = 0;
    // 1. Claim (0-15)
    if (m.isClaimed === 'yes') score += 15;
    else if (m.isClaimed === 'partial') score += 8;
    // 2. NAP (0-10)
    if (m.napConsistent) score += 10;
    // 3. Reviews (0-15)
    if (m.reviewCount > 50 && m.reviewRating > 4.4) score += 15;
    else if (m.reviewCount >= 10) score += 8;
    else if (m.reviewCount > 0) score += 3;
    // 4. Activity (0-10)
    if (m.isActiveRecent) score += 5; 
    // 5. Photo Quality (0-5)
    let photoQualityScore = 0;
    if (m.hasProfessionalPhotos) photoQualityScore += 2;
    if (m.hasInterior) photoQualityScore += 1;
    if (m.hasExterior) photoQualityScore += 2;
    score += photoQualityScore;
    // 6. 360 (0-10)
    if (m.has360 === 'professional') score += 10;
    else if (m.has360 === 'basic') score += 5;
    // 7. Categories (0-5)
    if (m.categoriesOptimized) score += 5;
    // 8. Competitors (0-10)
    if (m.competitorRanking === 'top3') score += 10;
    else if (m.competitorRanking === 'top10') score += 5;
    
    // 9. Digital Presence (0-15)
    if (m.hasWebsite) score += 5;
    if (m.hasMenuOrBooking) score += 5;
    if (m.hasWhatsApp || m.hasInstagram) score += 5;

    // 10. Photo Count (0-5)
    if (m.photoCount > 20) score += 5;
    else if (m.photoCount > 5) score += 2;

    return Math.min(score, 100);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setLoadingText(t.analyzing);
    
    const score = calculateScore(auditMetrics);
    
    // Simulate scanning steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingText(t.analyzingCompetitors);
    
    const aiData = await generateAIAnalysis(auditMetrics, score, lang);
    
    if (aiData) {
      let level: 'Invisible' | 'Weak' | 'Visible' | 'Highly Visible' = 'Invisible';
      if (score >= 80) level = 'Highly Visible';
      else if (score >= 60) level = 'Visible';
      else if (score >= 30) level = 'Weak';

      setReport({
        metrics: auditMetrics,
        totalScore: score,
        level,
        visibilityAnalysis: aiData.visibilityAnalysis || "Analysis not available.",
        aiReadiness: aiData.aiReadiness || {
          level: 'Nascent',
          dataStrategyMaturity: 'Ad-hoc',
          governanceScore: 0,
          cultureScore: 0,
          notes: "No data.",
          priorityUseCases: []
        },
        changeRisk: aiData.changeRisk || {
          resistanceLevel: 'High',
          leadershipAlignment: 0,
          talentGap: 100,
          uxRisk: 100,
          notes: "No data.",
          recommendedInterventions: []
        },
        roiProjection: aiData.roiProjection || {
          estimatedAnnualRevenueLeakage: "Unknown",
          potentialRecoveryWithAI: "Unknown",
          timeToImpactMonths: 12,
          keyKPIs: [],
          narrative: "No data."
        },
        generatedAt: new Date().toISOString()
      });
      setView('report');
    }
    setIsGenerating(false);
  };

  const handleBriefingGenerate = async (formData: BoardBriefingFormData) => {
    if (!report) return;
    const response = await generateBoardBriefing({
      ...formData,
      report,
      locale: lang
    });
    
    if (response.success && response.briefing) {
      setBriefingContent(response.briefing);
    } else {
      alert(response.error || 'Failed to generate briefing');
    }
  };

  // Helper to handle package selection
  const handleSelectPlan = (pkg: Package) => {
      setSelectedPackage(pkg);
      setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
        {/* Simple Navigation/Header */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-6 h-6" />
                    <span className="font-bold tracking-wider">EIDOSENSE <span className="text-slate-500 text-xs font-normal">VISIBILITY X-RAY</span></span>
                </div>
                <div className="flex gap-2">
                    {(['en', 'me', 'tr'] as Language[]).map((l) => (
                        <button 
                            key={l} 
                            onClick={() => setLang(l)}
                            className={`px-3 py-1 text-xs font-bold rounded uppercase transition-all ${lang === l ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
            {view === 'audit' ? (
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{t.title}</h1>
                        <p className="text-slate-400 text-lg">{t.subtitle}</p>
                    </div>

                    {/* Search Box */}
                    <form onSubmit={handleMapSearch} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                            <input 
                                type="text" 
                                placeholder={t.searchPlaceholder}
                                className="flex-1 bg-transparent border-none px-6 py-4 text-white placeholder-slate-500 focus:ring-0 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={isSearching}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 font-bold tracking-wide disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {isSearching ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                <span className="hidden sm:inline">{t.searchButton}</span>
                            </button>
                        </div>
                    </form>

                    {/* Live Tracking Indicator */}
                    {userLocation && !isSearching && searchStatus === 'idle' && (
                        <div className="flex items-center justify-center gap-2 text-cyan-500 text-xs animate-pulse mt-2">
                            <MapPin className="w-3 h-3" />
                            <span>Live Location Tracking Active</span>
                        </div>
                    )}

                    {searchStatus === 'error' && (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-red-400 flex items-center gap-3">
                            <AlertOctagon className="w-5 h-5" />
                            {t.searchError}
                        </div>
                    )}

                    {searchStatus === 'success' && (
                        <>
                          {auditMetrics.businessName === 'EIDOSENSE_PARADOX' ? (
                             <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-12 text-center space-y-6 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-cyan-950 rounded-full flex items-center justify-center mx-auto border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                     <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">System Paradox</h2>
                                <p className="text-xl text-cyan-400 font-mono">
                                    {lang === 'tr' ? "Kendi kendini analiz edemezsin. Evren çökebilir. :)" : 
                                     lang === 'me' ? "Ne možete analizirati analizatora. Univerzum bi mogao kolabirati. :)" :
                                     "You cannot X-Ray the X-Ray machine. Nice try."}
                                </p>
                                <div className="p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-500">
                                    ERROR_CODE: RECURSIVE_AUDIT_ATTEMPT<br/>
                                    STATUS: BLOCKED_BY_ADMIN<br/>
                                    SOLUTION: SCAN_A_REAL_CLIENT
                                </div>
                                <button 
                                    onClick={() => {
                                        setSearchStatus('idle');
                                        setSearchQuery('');
                                    }}
                                    className="text-slate-400 hover:text-white underline"
                                >
                                    Reset System
                                </button>
                             </div>
                          ) : (
                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Results Card */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-mono text-cyan-500 mb-1">{t.autoFilled}</div>
                                            <h2 className="text-2xl font-bold text-white">{auditMetrics.businessName}</h2>
                                            <p className="text-slate-400 text-sm">{auditMetrics.address}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.score}</div>
                                            <div className="text-3xl font-bold text-white">{calculateScore(auditMetrics)}<span className="text-sm text-slate-500">/100</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-800 flex items-center justify-center bg-slate-950/50">
                                            <ScoreGauge score={calculateScore(auditMetrics)} />
                                        </div>
                                        <div className="p-6 h-64">
                                            <MapVisualizer 
                                                targetLocation={auditMetrics.location}
                                                competitorLocation={auditMetrics.benchmark?.location}
                                                targetName={auditMetrics.businessName}
                                                competitorName={auditMetrics.benchmark?.name}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-slate-800 border-t border-slate-800">
                                        <div className="p-4 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Google Maps</div>
                                            <div className={`font-bold ${auditMetrics.isClaimed === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                                                {auditMetrics.isClaimed === 'yes' ? 'Claimed' : 'Unclaimed'}
                                            </div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Reviews</div>
                                            <div className="font-bold text-white">{auditMetrics.reviewCount} <span className="text-xs text-slate-500">({auditMetrics.reviewRating}★)</span></div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Photos</div>
                                            <div className="font-bold text-white">{auditMetrics.photoCount}</div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Competitor</div>
                                            <div className="font-bold text-red-400 truncate px-2">{auditMetrics.benchmark?.name || 'Unknown'}</div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            {loadingText}
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-6 h-6" />
                                            {t.generateReport}
                                        </>
                                    )}
                                </button>
                             </div>
                          )}
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Report Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                         <div>
                             <div className="flex items-center gap-2 text-slate-400 mb-1">
                                 <button onClick={() => setView('audit')} className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-sm">
                                     <ChevronRight className="w-4 h-4 rotate-180" /> Back
                                 </button>
                                 <span className="text-slate-700">/</span>
                                 <span className="text-xs font-mono text-cyan-500">REPORT #{Math.floor(Math.random()*10000)}</span>
                             </div>
                             <h1 className="text-3xl font-bold text-white">{auditMetrics.businessName}</h1>
                         </div>
                         <div className="flex gap-3">
                             <button 
                                onClick={() => setIsBriefingModalOpen(true)}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded border border-slate-700 flex items-center gap-2 transition-colors"
                             >
                                 <Briefcase className="w-4 h-4" />
                                 <span>Board Briefing</span>
                             </button>
                         </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-800 gap-1">
                        {[
                            {id: 'visibility', label: 'Visibility X-Ray', icon: Search},
                            {id: 'ai-readiness', label: 'AI Readiness', icon: Brain},
                            {id: 'change', label: 'Change Risk', icon: Scale},
                            {id: 'roi', label: 'ROI Projection', icon: TrendingUp},
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'visibility' && report && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-cyan-500" />
                                            Visibility Analysis
                                        </h3>
                                        <div className="prose prose-invert max-w-none text-slate-300">
                                            <p className="whitespace-pre-line">{report.visibilityAnalysis}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Packages List */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-white">{t.packages}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {getDynamicPackages(auditMetrics, lang).map((pkg, idx) => (
                                                <div key={idx} className={`relative bg-slate-900 border rounded-xl p-6 flex flex-col ${pkg.recommended ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-slate-800'}`}>
                                                    {pkg.recommended && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t.recommended}</div>
                                                    )}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-white">{pkg.name}</h4>
                                                            {pkg.highlight && <div className="text-xs text-cyan-400 mt-1">{pkg.highlight}</div>}
                                                        </div>
                                                        <div className="text-xl font-mono font-bold text-white">{pkg.price}</div>
                                                    </div>
                                                    <ul className="space-y-2 mb-6 flex-1">
                                                        {pkg.features.map((f, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                                <span>{f}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <button 
                                                        onClick={() => handleSelectPlan(pkg)}
                                                        className={`w-full py-2 rounded font-bold transition-colors ${pkg.recommended ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                                                    >
                                                        {t.selectPlan}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats */}
                                <div className="space-y-6">
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">{t.benchmark}</h3>
                                        {auditMetrics.benchmark ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white font-bold">{auditMetrics.benchmark.name}</span>
                                                    <span className="text-yellow-400 font-bold">{auditMetrics.benchmark.rating}★</span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-red-500 h-full w-[80%]"></div>
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {t.outperformingPre} <strong>{(auditMetrics.benchmark.reviewCount - auditMetrics.reviewCount)}</strong> {t.outperformingPost}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-500 text-sm italic">{t.noBenchmark}</div>
                                        )}
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                         <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">{t.threatLevel}</h3>
                                         <div className="flex items-center gap-3 mb-2">
                                            <div className={`text-2xl font-bold ${report.totalScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                                                {(LEVEL_TRANSLATIONS[lang] && LEVEL_TRANSLATIONS[lang][report.level]) || report.level}
                                            </div>
                                         </div>
                                         <p className="text-xs text-slate-400 leading-relaxed">
                                            {t.threatDesc1} <strong className="text-white">{(LEVEL_TRANSLATIONS[lang] && LEVEL_TRANSLATIONS[lang][report.level]) || report.level}</strong>. 
                                            {t.threatDesc2} {auditMetrics.benchmark?.name || 'competitors'} {t.threatDesc3}
                                         </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'ai-readiness' && report && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                     <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Brain className="text-cyan-500" /> Readiness Assessment</h3>
                                     <div className="text-4xl font-bold text-white mb-2">{report.aiReadiness.level}</div>
                                     <p className="text-slate-400 mb-6">{report.aiReadiness.notes}</p>
                                     
                                     <div className="space-y-4">
                                         <div>
                                             <div className="flex justify-between text-xs text-slate-400 mb-1">Governance Score</div>
                                             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                 <div className="bg-cyan-500 h-full transition-all duration-1000" style={{width: `${report.aiReadiness.governanceScore}%`}}></div>
                                             </div>
                                         </div>
                                         <div>
                                             <div className="flex justify-between text-xs text-slate-400 mb-1">Culture & Adoption</div>
                                             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                 <div className="bg-purple-500 h-full transition-all duration-1000" style={{width: `${report.aiReadiness.cultureScore}%`}}></div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                     <h3 className="font-bold text-white mb-4">Priority Use Cases</h3>
                                     <ul className="space-y-3">
                                         {report.aiReadiness.priorityUseCases.map((uc, i) => (
                                             <li key={i} className="flex gap-3 p-3 bg-slate-950/50 rounded border border-slate-800">
                                                 <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
                                                 <span className="text-slate-300 text-sm">{uc}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                        )}
                        
                        {activeTab === 'change' && report && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-1">
                                    <h3 className="font-bold text-white mb-6">Risk Matrix</h3>
                                    <div className="space-y-6">
                                         <div className="text-center">
                                             <div className="text-sm text-slate-500 mb-2">Resistance Level</div>
                                             <div className={`text-3xl font-bold ${report.changeRisk.resistanceLevel === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                 {report.changeRisk.resistanceLevel}
                                             </div>
                                         </div>
                                         <div className="border-t border-slate-800 pt-6">
                                             <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-400">Talent Gap</span>
                                                <span className="text-white">{report.changeRisk.talentGap}%</span>
                                             </div>
                                             <div className="w-full bg-slate-800 h-1.5 rounded-full">
                                                <div className="bg-red-500 h-full" style={{width: `${report.changeRisk.talentGap}%`}}></div>
                                             </div>
                                         </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
                                    <h3 className="font-bold text-white mb-4">Intervention Plan</h3>
                                    <p className="text-slate-400 mb-6">{report.changeRisk.notes}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {report.changeRisk.recommendedInterventions.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2 p-3 bg-slate-800/50 rounded">
                                                <CheckCircle className="w-4 h-4 text-cyan-500 mt-1 shrink-0" />
                                                <span className="text-sm text-slate-200">{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'roi' && report && (
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                                 <h3 className="text-2xl font-bold text-white mb-8">Financial Impact Projection</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                     <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl">
                                         <div className="text-red-400 text-sm uppercase tracking-wider mb-2">Annual Leakage</div>
                                         <div className="text-4xl font-bold text-white">{report.roiProjection.estimatedAnnualRevenueLeakage}</div>
                                         <div className="text-xs text-red-300/70 mt-2">Estimated revenue lost to competitors</div>
                                     </div>
                                     <div className="p-6 bg-green-950/20 border border-green-900/50 rounded-xl">
                                         <div className="text-green-400 text-sm uppercase tracking-wider mb-2">Recovery Potential</div>
                                         <div className="text-4xl font-bold text-white">{report.roiProjection.potentialRecoveryWithAI}</div>
                                         <div className="text-xs text-green-300/70 mt-2">With full AI integration</div>
                                     </div>
                                     <div className="p-6 bg-blue-950/20 border border-blue-900/50 rounded-xl">
                                         <div className="text-blue-400 text-sm uppercase tracking-wider mb-2">Time to Impact</div>
                                         <div className="text-4xl font-bold text-white">{report.roiProjection.timeToImpactMonths} <span className="text-lg font-normal text-slate-400">months</span></div>
                                         <div className="text-xs text-blue-300/70 mt-2">Break-even point</div>
                                     </div>
                                 </div>
                                 <div className="text-left bg-slate-950 p-6 rounded-lg border border-slate-800">
                                     <h4 className="font-bold text-white mb-2">Analyst Note</h4>
                                     <p className="text-slate-400 text-sm leading-relaxed">{report.roiProjection.narrative}</p>
                                 </div>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </main>

        {/* Modal */}
        <BoardBriefingModal 
            isOpen={isBriefingModalOpen}
            onClose={() => setIsBriefingModalOpen(false)}
            auditMetrics={auditMetrics}
            locale={lang}
            onGenerate={handleBriefingGenerate}
        />

        {/* Contact / Plan Selection Modal */}
        <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            selectedPackage={selectedPackage}
            locale={lang}
        />
        
        {/* Generated Briefing Overlay (Simple) */}
        {briefingContent && (
            <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-white text-slate-900 max-w-3xl w-full max-h-[85vh] rounded-lg flex flex-col shadow-2xl">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-100 rounded-t-lg">
                        <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Generated Board Briefing</h3>
                        <button onClick={() => setBriefingContent(null)} className="hover:bg-slate-200 p-1 rounded"><X /></button>
                    </div>
                    <div className="p-8 overflow-y-auto font-serif whitespace-pre-line leading-relaxed">
                        {briefingContent}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 rounded-b-lg">
                        <button 
                            onClick={() => {navigator.clipboard.writeText(briefingContent); alert('Copied to clipboard!');}}
                            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" /> Copy Text
                        </button>
                        <button 
                            onClick={() => setBriefingContent(null)}
                            className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};