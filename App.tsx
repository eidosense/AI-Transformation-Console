
import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Share2, LayoutDashboard, Search, ChevronRight, AlertOctagon, MapPin, Zap, TrendingUp, Target, Lock, Globe, Link as LinkIcon, Megaphone, Brain, Database, Users, ShieldAlert, Briefcase, ArrowUpRight, BarChart3, PieChart, FileText, Copy, X, ExternalLink, Phone, Instagram, MessageCircle, Box, Scale } from 'lucide-react';
import { generateAIAnalysis, searchBusinessOnMaps, generateBoardBriefing } from './services/geminiService';
import { Language, AuditMetrics, ReportData, Package, BoardBriefingFormData } from './types';
import { TRANSLATIONS, INITIAL_METRICS } from './constants';
import ScoreGauge from './components/ScoreGauge';
import MapVisualizer from './components/MapVisualizer';
import { BoardBriefingModal } from './components/BoardBriefingModal';

const App: React.FC = () => {
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
  
  // Briefing Modal State
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingContent, setBriefingContent] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // --- DYNAMIC PACKAGE GENERATION ---
  const getDynamicPackages = (metrics: AuditMetrics, lang: Language): Package[] => {
     const packages: Package[] = [];

     // 1. BASE PACKAGE (Always needed)
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
            me: ["Google Street View Sertifikat", `Cijena za veličinu: ${metrics.venueSize}`, "VR Hosting Uključen", "Povećanje Konverzije (+30%)"],
            tr: ["Google Street View Onaylı", `${m2Text} İçin Fiyat`, "VR Barındırma Dahil", "Dönüşüm Artışı (+30%)"]
        };

        packages.push({
            name: titles[lang],
            price: price,
            highlight: lang === 'tr' ? `m² Bazlı Teklif (${metrics.venueSize})` : (lang === 'me' ? `Ponuda po kvadraturi (${metrics.venueSize})` : `${metrics.venueSize} Venue Pricing`),
            recommended: true,
            features: features[lang]
        });
     }

     // 3. WEBSITE / DIGITAL PRESENCE
     if (!metrics.hasWebsite) {
         const titles = {
             en: "Web Transformation", me: "Web Transformacija", tr: "Web Dönüşümü"
         };
         const features = {
             en: ["High-Performance Next.js Site", "Direct Booking Engine", "SEO Foundation", "Mobile-First"],
             me: ["Ultra-brzi Sajt (Next.js)", "Direktne Rezervacije", "SEO Temelj", "Mobile-First Dizajn"],
             tr: ["Yüksek Performanslı Web Sitesi", "Direkt Rezervasyon Motoru", "SEO Temeli", "Mobil Öncelikli"]
         };
         packages.push({
            name: titles[lang],
            price: "€990",
            features: features[lang]
         });
     }

     // 4. MARKET DOMINANCE (Always available as upsell)
     const domTitles = {
         en: "Market Dominator", me: "Tržišna Dominacija", tr: "Pazar Hükümdarı"
     };
     const domFeatures = {
         en: ["Aggressive Ad Ops", "Reputation Defense", "Influencer Outreach", "Full SEO & Backlink Strategy"],
         me: ["Agresivne Kampanje (Ads)", "Upravljanje Reputacijom", "Influencer Saradnja", "Potpuna SEO Dominacija"],
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
    
    const result = await searchBusinessOnMaps(searchQuery, lang);
    
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
    // 9. Backlink Authority (0-10)
    if (m.backlinkAuthority === 'High') score += 10;
    else if (m.backlinkAuthority === 'Medium') score += 5;
    // 10. Influencer Impact (0-10)
    if (m.influencerImpact === 'Viral') score += 10;
    else if (m.influencerImpact === 'Moderate') score += 5;
    // 11. Website & CTA (0-5)
    let ctaScore = 0;
    if (m.hasWebsite) ctaScore += 2;
    if (m.hasMenuOrBooking) ctaScore += 1;
    if (m.hasWhatsApp || m.hasInstagram) ctaScore += 2;
    score += Math.min(5, ctaScore);

    return Math.min(100, score);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLoadingText(t.analyzing);
    const score = calculateScore(auditMetrics);
    
    setTimeout(() => setLoadingText(t.analyzingCompetitors), 2000);
    
    let level: ReportData['level'] = 'Invisible';
    if (score >= 80) level = 'Highly Visible';
    else if (score >= 60) level = 'Visible';
    else if (score >= 40) level = 'Weak';

    // Call Gemini
    const analysisData = await generateAIAnalysis(auditMetrics, score, lang);

    // Check if analysisData is valid
    if (analysisData) {
        setReport({
            metrics: auditMetrics,
            totalScore: score,
            level,
            visibilityAnalysis: analysisData.visibilityAnalysis || "Analysis Failed",
            aiReadiness: analysisData.aiReadiness as any,
            changeRisk: analysisData.changeRisk as any,
            roiProjection: analysisData.roiProjection as any,
            generatedAt: new Date().toISOString()
        });
        setView('report');
        window.scrollTo(0,0);
    } else {
        // Fallback if AI fails
        alert("AI Analysis generation failed. Please try again.");
    }

    setIsGenerating(false);
  };

  const handleBriefingGenerate = async (formData: BoardBriefingFormData) => {
    if (!report) return;
    
    const result = await generateBoardBriefing({
        ...formData,
        report: report, 
        locale: lang
    });

    if (result.success && result.briefing) {
        setBriefingContent(result.briefing);
        setIsBriefingModalOpen(false);
    } else {
        console.error("Briefing failed:", result.error);
        alert("Failed to generate briefing. Please try again.");
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 60) return "text-orange-500";
    if (score < 80) return "text-yellow-400";
    return "text-emerald-500";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900 flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('audit')}>
            {/* Eidosense Logo / Icon Placeholder */}
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-slate-900 transform rotate-45 bg-transparent"></div>
            </div>
            <div className="flex flex-col leading-tight">
                <h1 className="font-bold text-xl tracking-tight text-white">
                  EIDOSENSE <span className="font-light text-slate-400">VISIBILITY X-RAY</span>
                </h1>
                <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.2em]">AI Transformation Console</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-xs text-slate-500 font-mono border border-slate-800 px-2 py-1 rounded">
                 v2.5.1 [LEGAL]
             </div>
             <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {Object.values(Language).map((l) => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    lang === l 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {l.toUpperCase()}
                </button>
                ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 w-full">
        
        {/* AUDIT VIEW */}
        {view === 'audit' && (
          <div className="animate-fadeIn space-y-12">
            <div className="text-center py-16 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-slate-400 mb-6 tracking-tight">
                {t.subtitle}
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-light">
                 AI alone doesn’t change business. <span className="text-white font-normal">Strategy, psychology, and execution do.</span>
              </p>
              <p className="mt-2 text-sm text-slate-500 uppercase tracking-widest">
                  Start your diagnostic below
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="max-w-2xl mx-auto mb-16 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25"></div>
              <div className="relative bg-slate-900 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-white placeholder-slate-600 text-lg focus:ring-0 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={handleMapSearch}
                  disabled={isSearching || !searchQuery}
                  className="bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSearching ? (
                    <>
                       <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm">{t.searching}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-cyan-600 fill-current" />
                      <span>{t.searchButton}</span>
                    </>
                  )}
                </button>
              </div>
              {searchStatus === 'error' && (
                <div className="mt-4 text-center text-red-400 text-sm font-mono">
                   [SYSTEM ALERT] {t.searchError}
                </div>
              )}
            </div>

            {/* LIVE DATA DASHBOARD (PRE-REPORT) */}
            {searchStatus === 'success' && (
                <div className="animate-fadeInUp grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Map Visualizer */}
                    <div className="lg:col-span-4">
                        <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50"></div>
                           <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Geo-Location Intel
                              </h3>
                              <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-[10px] text-slate-400">LIVE</span>
                              </div>
                           </div>
                           <div className="flex-grow">
                              <MapVisualizer 
                                targetLocation={auditMetrics.location}
                                competitorLocation={auditMetrics.benchmark?.location}
                                targetName={auditMetrics.businessName}
                                competitorName={auditMetrics.benchmark?.name}
                              />
                           </div>
                        </div>
                    </div>

                    {/* Metrics & Action */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                            {/* Scanlines effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-white">{auditMetrics.businessName}</h2>
                                    {auditMetrics.googleMapsUri && (
                                        <a 
                                            href={auditMetrics.googleMapsUri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-slate-500 hover:text-cyan-400 transition"
                                            title="Open Real Google Maps Listing"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                  </div>
                                  <p className="text-slate-500 text-sm font-mono">{auditMetrics.industry} • {auditMetrics.address}</p>
                                </div>
                                <div className="text-right hidden md:block">
                                    <span className="text-xs text-slate-500 uppercase block">System Status</span>
                                    <span className="text-emerald-400 font-mono text-sm">Ready for Deep Scan</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <MetricCard 
                                    label={t.searchVolume}
                                    value={auditMetrics.searchVolume} 
                                    color={auditMetrics.searchVolume === 'High' ? 'text-green-400' : 'text-yellow-400'} 
                                    icon={<Search className="w-4 h-4" />}
                                />
                                <MetricCard 
                                    label={t.brandMentions}
                                    value={auditMetrics.brandMentions} 
                                    color={auditMetrics.brandMentions === 'Viral' ? 'text-pink-400' : 'text-slate-400'} 
                                    icon={<MessageCircle className="w-4 h-4" />}
                                />
                                <MetricCard 
                                    label="Reviews" 
                                    value={auditMetrics.reviewCount.toString()} 
                                    color="text-white" 
                                    icon={<Users className="w-4 h-4" />}
                                />
                                <MetricCard 
                                    label="Venue Size" 
                                    value={auditMetrics.venueSize} 
                                    color="text-cyan-400"
                                    icon={<Box className="w-4 h-4" />}
                                />
                            </div>

                            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                                    <Briefcase className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">Benchmark Target: {auditMetrics.benchmark?.name || "Unknown"}</h4>
                                    <p className="text-xs text-slate-400">Comparing your digital footprint against the category leader.</p>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full md:w-auto px-6 py-3 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                         <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                         <span className="text-xs">{loadingText}</span>
                                        </>
                                    ) : (
                                        <>
                                         <span>{t.generateReport}</span>
                                         <ArrowUpRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* REPORT VIEW */}
        {view === 'report' && report && (
          <div className="animate-fadeInUp pb-20">
            {/* Top Controls */}
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setView('audit')} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono">
                 &larr; NEW AUDIT
               </button>
               <div className="flex gap-2">
                   <button 
                     onClick={() => setIsBriefingModalOpen(true)}
                     className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg text-white flex items-center gap-2 text-xs font-bold uppercase shadow-lg shadow-cyan-500/20"
                   >
                     <FileText className="w-3 h-3" /> Board Briefing
                   </button>
                   <button onClick={() => window.print()} className="bg-slate-900 border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-lg text-slate-300 flex items-center gap-2 text-xs font-bold uppercase">
                     <Share2 className="w-3 h-3" /> Export PDF
                   </button>
               </div>
            </div>

            {/* REPORT CONTAINER */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden min-h-[80vh]">
                
                {/* Report Header */}
                <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <h2 className="text-2xl font-bold text-white">{report.metrics.businessName}</h2>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.totalScore >= 60 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                 {report.totalScore}/100 Score
                             </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono uppercase">AI Transformation Audit • {new Date().toLocaleDateString()}</p>
                    </div>
                    {/* TAB NAVIGATION */}
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        {[
                            { id: 'visibility', label: 'Visibility X-Ray', icon: <Globe className="w-3 h-3"/> },
                            { id: 'ai-readiness', label: 'AI Readiness', icon: <Brain className="w-3 h-3"/> },
                            { id: 'change', label: 'Change Risk', icon: <Users className="w-3 h-3"/> },
                            { id: 'roi', label: 'ROI Simulation', icon: <TrendingUp className="w-3 h-3"/> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {tab.icon}
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAB CONTENT AREA */}
                <div className="p-6 md:p-8 bg-slate-900 min-h-[500px]">
                    
                    {/* 1. VISIBILITY TAB */}
                    {activeTab === 'visibility' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                            <div className="lg:col-span-1">
                                <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center h-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10 pointer-events-none"></div>
                                    <ScoreGauge score={report.totalScore} />
                                    <div className="mt-6 text-center z-20 relative">
                                        <h3 className={`text-xl font-bold ${getScoreColorClass(report.totalScore)} mb-1`}>
                                            {report.level}
                                        </h3>
                                        <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                                            Based on 13 data points including Search Volume & Social Gravity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Competitive Intelligence
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line border-l-2 border-cyan-500 pl-4">
                                        {report.visibilityAnalysis}
                                    </p>
                                </div>

                                {/* DIGITAL ASSETS STATUS SECTION */}
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <LinkIcon className="w-3 h-3" /> Digital Access Points
                                        </h3>
                                        <span className="text-[10px] text-slate-600 italic">* {t.notDetected}</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <div className={`p-3 rounded border flex items-center gap-2 ${report.metrics.hasWebsite ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' : 'bg-red-900/10 border-red-900/30 text-red-400'}`}>
                                            {report.metrics.hasWebsite ? <CheckCircle className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                                            <span className="text-xs font-bold">Website</span>
                                        </div>
                                        <div className={`p-3 rounded border flex items-center gap-2 ${report.metrics.hasMenuOrBooking ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' : 'bg-red-900/10 border-red-900/30 text-red-400'}`}>
                                            {report.metrics.hasMenuOrBooking ? <CheckCircle className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                                            <span className="text-xs font-bold">Menu/Book</span>
                                        </div>
                                        <div className={`p-3 rounded border flex items-center gap-2 ${report.metrics.hasInstagram ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' : 'bg-red-900/10 border-red-900/30 text-red-400'}`}>
                                            {report.metrics.hasInstagram ? <Instagram className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                                            <span className="text-xs font-bold">Instagram</span>
                                        </div>
                                        <div className={`p-3 rounded border flex items-center gap-2 ${report.metrics.hasWhatsApp ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' : 'bg-red-900/10 border-red-900/30 text-red-400'}`}>
                                            {report.metrics.hasWhatsApp ? <Phone className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                                            <span className="text-xs font-bold">WhatsApp</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase mb-1">Benchmark Leader</div>
                                        <div className="text-lg font-bold text-white">{report.metrics.benchmark?.name}</div>
                                        <div className="text-emerald-400 font-mono text-sm">{report.metrics.benchmark?.rating} Rating</div>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase mb-1">Your Status</div>
                                        <div className="text-lg font-bold text-white">{report.metrics.competitorRanking === 'top3' ? 'Top Tier' : 'Lagging'}</div>
                                        <div className="text-slate-400 font-mono text-sm">{report.metrics.reviewCount} Reviews</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. AI READINESS TAB */}
                    {activeTab === 'ai-readiness' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                            <div className="space-y-6">
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                    <h3 className="text-sm font-bold text-cyan-500 uppercase mb-6 tracking-wider">Maturity Assessment</h3>
                                    <div className="space-y-6">
                                        <ProgressBar label="Governance & Security" value={report.aiReadiness.governanceScore} color="bg-purple-500" />
                                        <ProgressBar label="Data Culture" value={report.aiReadiness.cultureScore} color="bg-cyan-500" />
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-900">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 text-sm">Overall Level</span>
                                            <span className="px-3 py-1 bg-slate-800 text-white rounded text-sm font-bold">{report.aiReadiness.level}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-slate-400 text-sm">Data Strategy</span>
                                            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-sm">{report.aiReadiness.dataStrategyMaturity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 h-full">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Architect's Notes</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                        "{report.aiReadiness.notes}"
                                    </p>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Priority Use Cases</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {report.aiReadiness.priorityUseCases.map((uc, i) => (
                                            <span key={i} className="px-3 py-1 bg-cyan-900/20 border border-cyan-500/30 text-cyan-300 text-xs rounded-full">
                                                {uc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. CHANGE RISK TAB */}
                    {activeTab === 'change' && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <RiskCard title="Resistance" level={report.changeRisk.resistanceLevel} />
                                <RiskCard title="Leadership Gap" score={100 - report.changeRisk.leadershipAlignment} isInverse />
                                <RiskCard title="Talent Gap" score={report.changeRisk.talentGap} isInverse />
                            </div>
                            <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-xl mb-6">
                                <h3 className="text-red-400 font-bold uppercase text-sm mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> Critical Risk Analysis
                                </h3>
                                <p className="text-slate-300 text-sm">{report.changeRisk.notes}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.changeRisk.recommendedInterventions.map((rec, i) => (
                                    <div key={i} className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-slate-600" />
                                        <span className="text-sm text-slate-300">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. ROI TAB */}
                    {activeTab === 'roi' && (
                        <div className="animate-fadeIn text-center md:text-left">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-950 p-6 rounded-xl border border-red-900/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><ArrowUpRight className="w-12 h-12 text-red-500"/></div>
                                    <div className="text-xs text-slate-500 uppercase mb-2">Est. Annual Leakage</div>
                                    <div className="text-3xl font-bold text-red-400">{report.roiProjection.estimatedAnnualRevenueLeakage}</div>
                                    <div className="text-[10px] text-red-300/50 mt-1">Recurring Loss</div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-xl border border-emerald-900/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-12 h-12 text-emerald-500"/></div>
                                    <div className="text-xs text-slate-500 uppercase mb-2">Recovery Potential</div>
                                    <div className="text-3xl font-bold text-emerald-400">{report.roiProjection.potentialRecoveryWithAI}</div>
                                    <div className="text-[10px] text-emerald-300/50 mt-1">With Transformation</div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-2">Time to Impact</div>
                                    <div className="text-3xl font-bold text-white">{report.roiProjection.timeToImpactMonths} <span className="text-sm font-normal text-slate-500">Months</span></div>
                                </div>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Strategic Narrative</h3>
                                <p className="text-slate-300 text-sm italic">"{report.roiProjection.narrative}"</p>
                            </div>

                            <div className="border-t border-slate-800 pt-8">
                                <h3 className="text-center text-lg font-bold text-white mb-6 uppercase tracking-widest">Eidosense Dynamic Solutions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {getDynamicPackages(report.metrics, lang).map((pkg, i) => (
                                        <div key={i} className={`bg-slate-950 border p-6 rounded-xl flex flex-col ${pkg.recommended ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-slate-800'}`}>
                                            {pkg.highlight && (
                                                <div className="bg-cyan-900/30 text-cyan-400 text-[10px] font-bold uppercase px-2 py-1 rounded w-fit mb-2">
                                                    {pkg.highlight}
                                                </div>
                                            )}
                                            <h4 className="font-bold text-white mb-2">{pkg.name}</h4>
                                            <div className="text-xl font-bold text-slate-300 mb-4">{pkg.price}</div>
                                            <ul className="space-y-2 mb-6 flex-1">
                                                {pkg.features.map((f, idx) => (
                                                    <li key={idx} className="text-xs text-slate-500 flex items-start gap-2">
                                                        <CheckCircle className="w-3 h-3 text-cyan-800 mt-0.5"/> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                 {/* LEGAL DISCLAIMER FOOTER */}
                <div className="bg-slate-950 border-t border-slate-800 p-6">
                    <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-lg flex gap-4 items-start">
                        <Scale className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-amber-500 text-xs font-bold uppercase mb-1">{t.legalTitle}</h4>
                            <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed font-mono">
                                {t.legalText}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Eidosense Footer Form */}
            <div className="mt-12 border-t border-slate-800 pt-8 text-center md:text-left">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Turn this Audit into Action.</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Stop analyzing and start transforming. Book a strategic intervention with Eidosense.
                        </p>
                        <div className="text-xs text-slate-500 font-mono">
                            <p>arya@eidosense.com</p>
                            <p>+382-68-753-688</p>
                        </div>
                    </div>
                    <div>
                        <form className="flex flex-col gap-3">
                            <input type="email" placeholder="Your professional email" className="bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-cyan-500 outline-none" />
                            <button type="button" className="bg-white text-slate-900 font-bold p-3 rounded hover:bg-slate-200 transition-colors uppercase text-sm">
                                Request Full Proposal
                            </button>
                        </form>
                    </div>
                </div>
                <div className="text-center mt-12 text-[10px] text-slate-700 uppercase tracking-widest">
                    © 2025 Eidosense D.O.O. All Rights Reserved.
                </div>
            </div>

          </div>
        )}
      </main>

      {/* MODALS & OVERLAYS */}
      {report && (
        <BoardBriefingModal
          isOpen={isBriefingModalOpen}
          onClose={() => setIsBriefingModalOpen(false)}
          auditMetrics={report.metrics}
          locale={lang}
          onGenerate={handleBriefingGenerate}
        />
      )}

      {/* Briefing Result Display Overlay */}
      {briefingContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-slate-50 text-slate-900 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
                     <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-slate-700"/>
                        <h2 className="text-xl font-bold font-serif text-slate-900">Confidential Board Briefing</h2>
                     </div>
                     <button onClick={() => setBriefingContent(null)} className="text-slate-500 hover:text-slate-900 transition">
                        <X className="w-6 h-6"/>
                     </button>
                </div>
                <div className="p-8 bg-white flex-grow font-serif text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {briefingContent}
                </div>
                 <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 print:hidden sticky bottom-0">
                    <button onClick={() => {navigator.clipboard.writeText(briefingContent); alert('Copied to clipboard');}} className="px-4 py-2 border border-slate-300 rounded hover:bg-white transition flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Copy className="w-4 h-4"/> Copy Text
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition flex items-center gap-2 text-sm font-semibold shadow-lg">
                        <FileText className="w-4 h-4"/> Print / PDF
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const MetricCard = ({ label, value, color, icon }: any) => (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs uppercase">
            {icon} {label}
        </div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
);

const ProgressBar = ({ label, value, color }: any) => (
    <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const RiskCard = ({ title, level, score, isInverse }: any) => {
    let color = 'text-slate-500';
    if (level) {
        if (level === 'High') color = 'text-red-500';
        else if (level === 'Medium') color = 'text-orange-500';
        else color = 'text-emerald-500';
    } else if (score !== undefined) {
        // If isInverse, High score = High Risk (Red)
        // If normal, High score = Good (Green) - Wait, logic check:
        // Leadership Alignment: High is Good (Green).
        // Talent Gap: High is Bad (Red).
        if (isInverse) {
             // High score is Bad
             if (score > 60) color = 'text-red-500';
             else if (score > 30) color = 'text-orange-500';
             else color = 'text-emerald-500';
        } else {
             // High score is Good
             if (score > 70) color = 'text-emerald-500';
             else if (score > 40) color = 'text-orange-500';
             else color = 'text-red-500';
        }
    }

    return (
        <div className="bg-slate-950 p-4 rounded border border-slate-800 text-center">
            <div className="text-xs text-slate-500 uppercase mb-2">{title}</div>
            <div className={`text-xl font-bold ${color}`}>
                {level || `${score}/100`}
            </div>
        </div>
    );
};

export default App;
