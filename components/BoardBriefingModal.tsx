
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
        'Pretvorite ovu analizu u formalni dokument za donosioce odluka (CEO/CFO) koji jasno ukazuje na propuštene prihode i rizike.',
      disclaimer:
        'Generišemo izvještaje isključivo za stvarne poslovne subjekte. Molimo koristite poslovni email — javni domeni (gmail, yahoo, itd.) se automatski odbijaju.',
      fullName: 'Puno Ime',
      companyName: 'Naziv Kompanije',
      role: 'Vaša Funkcija',
      workEmail: 'Službeni Email',
      emailPlaceholder: 'vi@kompanija.com',
      generate: 'Generiši Dokument',
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
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <Briefcase className="w-6 h-6 text-cyan-400 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">{text.title}</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {text.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mx-6 mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {text.disclaimer}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {text.fullName}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/70 transition"
            />
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {text.companyName}
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/70 transition"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {text.role}
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/70 transition"
            >
              <option value="">Select role...</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Work Email */}
          <div>
            <label
              htmlFor="workEmail"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {text.workEmail}
            </label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              required
              placeholder={text.emailPlaceholder}
              value={formData.workEmail}
              onChange={handleChange}
              className={`w-full bg-slate-800 border ${
                emailError ? 'border-red-500' : 'border-slate-700'
              } text-slate-100 text-sm px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 ${
                emailError ? 'focus:ring-red-500/70' : 'focus:ring-cyan-500/70'
              } transition`}
            />
            {emailError && (
              <p className="mt-2 text-xs text-red-400">{emailError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 transition"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generating...' : text.generate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
