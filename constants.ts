

import { Language, Package, TranslationKey, AuditMetrics } from './types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    title: "ShadowRank",
    subtitle: "AI Transformation & Digital X-Ray by Eidosense",
    startAudit: "Start New Audit",
    businessDetails: "Live Data Detected",
    score: "Visibility Score",
    findings: "Critical Findings",
    opportunities: "Lost Opportunities",
    solutions: "Digital Solutions",
    contact: "Activate Protocol",
    packages: "Recommended Modules",
    generateReport: "Generate Transformation Roadmap",
    analyzing: "Scanning Digital & AI Footprint...",
    analyzingCompetitors: "Calculating Revenue Leakage...",
    critical: "Fatal Errors",
    good: "Survival Assets",
    reportTitle: "AI Transformation Console",
    benchmark: "The Alpha Competitor",
    competitors: "Local Threats",
    contactCta: "Stop bleeding revenue. Fix this now.",
    levelInvisible: "INVISIBLE (DEAD)",
    levelWeak: "WEAK (VULNERABLE)",
    levelVisible: "VISIBLE (AVERAGE)",
    levelHigh: "DOMINANT",
    searchPlaceholder: "Enter Business Name...",
    searchButton: "Scan Business",
    searching: "Infiltrating Google Maps...",
    searchError: "Target not found. Are you even on the map?",
    autoFilled: "Target Acquired.",
    manualOverride: "Defense Protocol",
    gapDetected: "Dominance Gap Detected",
    marketLeader: "The Alpha",
    you: "The Target",
    poweredBy: "Strategy & Intelligence by Eidosense",
    
    // UI Elements
    selectPlan: "View Strategy",
    recommended: "Strategic Fit",
    threatLevel: "Threat Level",
    
    // Dynamic Sentences (Use {placeholders} manually in code if needed, or split strings)
    outperformingPre: "Outperforming you by",
    outperformingPost: "reviews.",
    noBenchmark: "No direct benchmark detected.",
    
    threatDesc1: "Your digital footprint is currently",
    threatDesc2: "This means you are losing traffic to",
    threatDesc3: "daily.",

    // New Metrics
    digitalAuthority: "Domain Authority",
    influencerImpact: "Influencer Impact",
    backlinkStatus: "Backlink Ecosystem",
    prStatus: "Press & Mentions",
    searchVolume: "Search Volume",
    brandMentions: "Brand Conversations",

    // Legal / Disclaimer
    legalTitle: "ALGORITHMIC LIMITATION & LIABILITY PROTOCOL",
    legalText: "This audit is an automated snapshot based on publicly available digital signals detectable by AI at the moment of scanning. 'Not Detected' does not confirm non-existence; it confirms non-visibility to standard search crawlers. If you have assets (e.g., Instagram) that were not detected, your SEO/Indexability is critically low. Eidosense is not liable for data discrepancies. This report is for strategic simulation purposes only.",
    notDetected: "Not Detected / Low Indexing"
  },
  [Language.ME]: {
    title: "ShadowRank",
    subtitle: "AI Transformacija i Digitalna Dijagnostika (by Eidosense)",
    startAudit: "Nova Revizija",
    businessDetails: "Detektovani Podaci",
    score: "Indeks Vidljivosti",
    findings: "Ključni Nalazi",
    opportunities: "Propuštene Prilike",
    solutions: "Digitalni Moduli",
    contact: "Aktiviraj Protokol",
    packages: "Preporučeni Moduli",
    generateReport: "Generiši Izvještaj o Transformaciji",
    analyzing: "Analiza Digitalnog Otiska...",
    analyzingCompetitors: "Procjena Gubitka Tržišnog Udjela...",
    critical: "Kritične Greške",
    good: "Pozitivni Indikatori",
    reportTitle: "Konzola za AI Transformaciju",
    benchmark: "Tržišni Lider (Benchmark)",
    competitors: "Lokalna Konkurencija",
    contactCta: "Zaustavite odliv prihoda. Reagujte odmah.",
    levelInvisible: "NEVIDLJIV (DIGITALNI MRAK)",
    levelWeak: "SLAB (RANJIV)",
    levelVisible: "VIDLJIV (PROSJEK)",
    levelHigh: "DOMİNANTAN",
    searchPlaceholder: "Unesite naziv biznisa...",
    searchButton: "Skeniraj",
    searching: "Pristup Google Mapama...",
    searchError: "Biznis nije pronađen. Da li je lokacija verifikovana?",
    autoFilled: "Meta Locirana.",
    manualOverride: "Ručni Unos",
    gapDetected: "Detektovan Jaz u Dominaciji",
    marketLeader: "Lider Kategorije",
    you: "Vaš Biznis",
    poweredBy: "Strategy & Intelligence by Eidosense",

    // UI Elements
    selectPlan: "Pogledaj Strategiju",
    recommended: "Strateški Odabir",
    threatLevel: "Nivo Opasnosti",

    // Dynamic Sentences
    outperformingPre: "Bolji od vas za",
    outperformingPost: "recenzija.",
    noBenchmark: "Direktan konkurent nije detektovan.",

    threatDesc1: "Vaš digitalni otisak je trenutno",
    threatDesc2: "To znači da svakodnevno gubite promet u korist",
    threatDesc3: ".",

    // New Metrics
    digitalAuthority: "Autoritet Domena",
    influencerImpact: "Uticaj Influensera",
    backlinkStatus: "Backlink Profil",
    prStatus: "Medijska Prisutnost",
    searchVolume: "Volumen Pretrage",
    brandMentions: "Pominjanja Brenda",

    // Legal / Disclaimer
    legalTitle: "PRAVNO ODRICANJE I OGRANIČENJA ALGORITMA",
    legalText: "Ovaj izvještaj predstavlja automatizovani presjek stanja zasnovan na javno dostupnim digitalnim signalima u trenutku skeniranja. Oznaka 'Nije Detektovano' ne potvrđuje nepostojanje, već nevidljivost za standardne pretraživače. Ukoliko posjedujete resurse (npr. Instagram) koji nisu prepoznati, to ukazuje na kritično lošu indeksaciju ili SEO. Eidosense ne preuzima odgovornost za eventualna odstupanja u podacima. Izvještaj služi isključivo u svrhe strateške simulacije.",
    notDetected: "Nije Detektovano / Loša Indeksacija"
  },
  [Language.TR]: {
    title: "ShadowRank",
    subtitle: "AI Dönüşüm & Dijital Röntgen (Eidosense)",
    startAudit: "Yeni Sorgu",
    businessDetails: "Tespit Edilen Veriler",
    score: "Görünürlük Puanı",
    findings: "Kritik Bulgular",
    opportunities: "Kayıp Fırsatlar",
    solutions: "Dijital Çözümler",
    contact: "Protokolü Başlat",
    packages: "Önerilen Modüller",
    generateReport: "Dönüşüm Yol Haritasını Çıkar",
    analyzing: "Dijital ve AI Ayak İzi Taranıyor...",
    analyzingCompetitors: "Gelir Sızıntısı Hesaplanıyor...",
    critical: "Ölümcül Hatalar",
    good: "Hayatta Tutanlar",
    reportTitle: "AI Dönüşüm Konsolu",
    benchmark: "Alpha Rakip",
    competitors: "Yerel Tehditler",
    contactCta: "Para kaybetmeyi bırakın. Şimdi düzeltin.",
    levelInvisible: "GÖRÜNMEZ (ÖLÜ)",
    levelWeak: "ZAYIF (SAVUNMASIZ)",
    levelVisible: "GÖRÜNÜR (SIRADAN)",
    levelHigh: "DOMİNANT",
    searchPlaceholder: "İşletme Adı Girin...",
    searchButton: "İşletmeyi Tara",
    searching: "Google Haritalara Sızılıyor...",
    searchError: "Bulunamadı. Haritada bile yok musunuz?",
    autoFilled: "Hedef Kilitlendi.",
    manualOverride: "Savunma Hattı",
    gapDetected: "Dominasyon Açığı",
    marketLeader: "Pazarın Efendisi",
    you: "Hedef (Siz)",
    poweredBy: "Strategy & Intelligence by Eidosense",

    // UI Elements
    selectPlan: "Stratejiyi Görüntüle",
    recommended: "Stratejik Uyum",
    threatLevel: "Tehdit Seviyesi",

    // Dynamic Sentences
    outperformingPre: "Sizden",
    outperformingPost: "yorum daha önde.",
    noBenchmark: "Doğrudan rakip tespit edilemedi.",

    threatDesc1: "Dijital ayak iziniz şu anda",
    threatDesc2: "Bu, trafiği her gün",
    threatDesc3: "tarafına kaptırdığınız anlamına gelir.",

    // New Metrics
    digitalAuthority: "Domain Otoritesi",
    influencerImpact: "Influencer Etkisi",
    backlinkStatus: "Backlink Ekosistemi",
    prStatus: "Basın ve Atıflar",
    searchVolume: "Arama Hacmi",
    brandMentions: "Marka Konuşulma Oranı",

    // Legal / Disclaimer
    legalTitle: "ALGORİTMİK SINIRLILIK & YASAL SORUMLULUK PROTOKOLÜ",
    legalText: "Bu denetim, tarama anında AI tarafından tespit edilebilen halka açık dijital sinyallere dayalı otomatik bir anlık görüntüdür. 'Tespit Edilemedi' ifadesi, varlığın olmadığını değil, standart arama motorları tarafından görülemediğini (görünmez olduğunu) doğrular. Tespit edilemeyen varlıklarınız (örn. Instagram) varsa, SEO/İndeksleme puanınız kritik derecede düşüktür. Eidosense veri uyuşmazlıklarından sorumlu değildir. Bu rapor yalnızca stratejik simülasyon amaçlıdır.",
    notDetected: "Tespit Edilemedi / Düşük İndeks"
  }
};

export const LEVEL_TRANSLATIONS: Record<Language, Record<string, string>> = {
    [Language.EN]: {
        'Invisible': 'invisible',
        'Weak': 'weak',
        'Visible': 'visible',
        'Highly Visible': 'highly visible'
    },
    [Language.ME]: {
        'Invisible': 'nevidljiv',
        'Weak': 'slab',
        'Visible': 'vidljiv',
        'Highly Visible': 'visoko vidljiv'
    },
    [Language.TR]: {
        'Invisible': 'görünmez',
        'Weak': 'zayıf',
        'Visible': 'görünür',
        'Highly Visible': 'yüksek görünürlükte'
    }
};

// NOTE: Actual packages are now generated dynamically in App.tsx based on metrics
// This is kept for type safety if needed elsewhere, but effectively deprecated for display.
export const PACKAGES: Record<Language, Package[]> = {
  [Language.EN]: [],
  [Language.ME]: [],
  [Language.TR]: []
};

export const INITIAL_METRICS: AuditMetrics = {
  businessName: '',
  industry: 'Business',
  isClaimed: 'no',
  claimStatusNotes: 'Pending Scan',
  napConsistent: false,
  reviewCount: 0,
  reviewRating: 0,
  isActiveRecent: false,
  hasProfessionalPhotos: false,
  hasInterior: false,
  hasExterior: false,
  has360: 'none',
  categoriesOptimized: false,
  competitorRanking: 'low',
  hasWebsite: false,
  hasMenuOrBooking: false,
  hasWhatsApp: false,
  hasInstagram: false,
  photoCount: 0,
  backlinkAuthority: 'Low',
  influencerImpact: 'None',
  searchVolume: 'Low',
  brandMentions: 'Ghost',
  venueSize: 'Medium'
};