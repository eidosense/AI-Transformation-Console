import React, { useState } from 'react';
import { X, AlertCircle, Briefcase } from 'lucide-react';
import type { BoardBriefingModalProps, BoardBriefingFormData } from '../types';

const ROLE_OPTIONS = [
  'Owner',
  'CEO',
  'CFO',
  'CMO',
  'CTO',
  'Manager',
  'Director',
  'Other',
];

// Free email domains to block
const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'mail.ru',
  'yandex.com',
  'protonmail.com',
  'aol.com',
  'zoho.com',
];

export function BoardBriefingModal({
  isOpen,
  onClose,
  auditMetrics,
  locale,
  onGenerate,
}: BoardBriefingModalProps) {
  const [formData, setFormData] = useState<BoardBriefingFormData>({
    fullName: '',
    companyName: '',
    role: '',
    workEmail: '',
  });

  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear email error when user types
    if (name === 'workEmail') {
      setEmailError('');
    }
  };

  const validateWorkEmail = (email: string): boolean => {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format.');
      return false;
    }

    // Extract domain
    const domain = email.split('@')[1]?.toLowerCase();

    // Check against free email list
    if (FREE_EMAIL_DOMAINS.includes(domain)) {
      setEmailError(
        'Free email addresses (gmail, yahoo, etc.) are not accepted. Please use your work email.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate work email
    if (!validateWorkEmail(formData.workEmail)) {
      return;
    }

    // Validate all fields
    if (
      !formData.fullName ||
      !formData.companyName ||
      !formData.role ||
      !formData.workEmail
    ) {
      setEmailError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    await onGenerate(formData);
    setIsSubmitting(false);
  };

  const text = {
    en: {
      title: 'Generate Board-Level AI Threat Memo',
      subtitle:
        'Turn your audit into a CFO/CEO-ready briefing document that you can forward directly to leadership.',
      disclaimer:
        'We only generate Board Briefings for real businesses. Use a work email — free emails (gmail, yahoo, etc.) are auto-rejected.',
      fullName: 'Full Name',
      companyName: 'Company Name',
      role: 'Your Role',
      workEmail: 'Work Email',
      emailPlaceholder: 'you@company.com',
      generate: 'Generate Board Briefing',
      cancel: 'Cancel',
    },
    me: {
      title: 'Generiši Strateški Memorandum (Board Briefing)',
      subtitle:
        'Pretvorite ovu analizu u formalni dokument za donosioce odluka (CEO/CFO) koji jasno kvantifikuje propuštene prihode i operativne rizike.',
      disclaimer:
        'Usluga je dostupna isključivo verifikovanim poslovnim subjektima. Molimo koristite službeni email — nalozi sa javnih domena (gmail, yahoo, itd.) neće biti procesuirani.',
      fullName: 'Ime i Prezime',
      companyName: 'Naziv Kompanije',
      role: 'Pozicija / Funkcija',
      workEmail: 'Službeni Email',
      emailPlaceholder: 'ime.prezime@kompanija.me',
      generate: 'Generiši Memorandum',
      cancel: 'Odustani',
    },
    tr: {
      title: 'Yönetim Kurulu Seviyesi AI Tehdit Notu Oluştur',
      subtitle:
        'Denetimini, doğrudan liderliğe iletebileceğin CFO/CEO hazır bir brifing belgesine dönüştür.',
      disclaimer:
        'Board Briefing\'leri yalnızca gerçek işletmeler için oluşturuyoruz. İş e-postanızı kullanın — ücretsiz e-postalar (gmail, yahoo, vb.) otomatik olarak reddedilir.',
      fullName: 'Tam Ad',
      companyName: 'Şirket Adı',
      role: 'Rolünüz',
      workEmail: 'İş E-postası',
      emailPlaceholder: 'sen@sirket.com',
      generate: 'Board Briefing Oluştur',
      cancel: 'İptal',
    },
  }[locale];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Briefcase size={20} />
              <span className="uppercase tracking-wider text-xs font-bold">CONFIDENTIAL // EIDOSENSE EXECUTIVE</span>
            </div>
            <h2 className="text-xl font-bold text-white">{text.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{text.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Disclaimer */}
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex gap-3 items-start">
             <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
             <p className="text-xs text-red-200 leading-relaxed">
                {text.disclaimer}
             </p>
          </div>

          <form id="briefing-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">{text.fullName}</label>
                    <input 
                        type="text" 
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">{text.companyName}</label>
                    <input 
                        type="text" 
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-1">
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">{text.role}</label>
                    <select 
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none"
                    >
                        <option value="" disabled>Select Role...</option>
                        {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">{text.workEmail}</label>
                    <input 
                        type="email" 
                        name="workEmail"
                        required
                        placeholder={text.emailPlaceholder}
                        value={formData.workEmail}
                        onChange={handleChange}
                        className={`w-full bg-slate-950 border rounded p-3 text-white focus:ring-1 outline-none transition-all ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'}`}
                    />
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 sticky bottom-0 z-10">
            <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
                {text.cancel}
            </button>
            <button 
                type="submit" 
                form="briefing-form"
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <Briefcase size={18} />
                        {text.generate}
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}