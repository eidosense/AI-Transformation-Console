
import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import type { ContactModalProps } from '../types';

export function ContactModal({ isOpen, onClose, selectedPackage, locale }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
      if (isOpen) setIsSubmitted(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would send data to backend
      setTimeout(() => {
          setIsSubmitted(true);
      }, 1000);
  };

  const t = {
      en: {
          title: 'Secure Transformation Plan',
          subtitle: 'Our team will deploy your selected package within 48 hours.',
          pkg: 'Selected Strategy:',
          email: 'Business Email',
          phone: 'Direct Phone',
          cta: 'Initialize Deployment',
          successTitle: 'Protocol Initiated',
          successMsg: 'An Eidosense strategist will contact you shortly to begin the transformation.',
          close: 'Close'
      },
      me: {
          title: 'Aktivacija Paketa',
          subtitle: 'Naš tim će aktivirati vaš odabrani paket u roku od 48h.',
          pkg: 'Odabrana Strategija:',
          email: 'Službeni Email',
          phone: 'Telefon',
          cta: 'Započni Transformaciju',
          successTitle: 'Zahtjev Primljen',
          successMsg: 'Eidosense strateg će vas uskoro kontaktirati radi početka implementacije.',
          close: 'Zatvori'
      },
      tr: {
          title: 'Dönüşüm Planını Başlat',
          subtitle: 'Ekibimiz seçtiğiniz paketi 48 saat içinde devreye alacaktır.',
          pkg: 'Seçilen Strateji:',
          email: 'İş E-postası',
          phone: 'Telefon',
          cta: 'Dağıtımı Başlat',
          successTitle: 'Protokol Başlatıldı',
          successMsg: 'Bir Eidosense stratejisti, dönüşümü başlatmak için kısa süre içinde sizinle iletişime geçecek.',
          close: 'Kapat'
      }
  }[locale];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md relative shadow-2xl overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"></div>

              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
              </button>

              {!isSubmitted ? (
                  <div className="p-8">
                      <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
                      <p className="text-slate-400 text-sm mb-6">{t.subtitle}</p>

                      {selectedPackage && (
                          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg mb-6">
                              <div className="text-xs uppercase text-cyan-500 font-bold tracking-wider mb-1">{t.pkg}</div>
                              <div className="font-bold text-white flex justify-between">
                                  <span>{selectedPackage.name}</span>
                                  <span className="font-mono">{selectedPackage.price}</span>
                              </div>
                          </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                              <label className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">{t.email}</label>
                              <input 
                                  type="email" 
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                              />
                          </div>
                          <div>
                              <label className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">{t.phone}</label>
                              <input 
                                  type="tel" 
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                              />
                          </div>
                          <button 
                              type="submit"
                              className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                          >
                              <Send className="w-4 h-4" />
                              {t.cta}
                          </button>
                      </form>
                  </div>
              ) : (
                  <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                          <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{t.successTitle}</h3>
                      <p className="text-slate-400 mb-6">{t.successMsg}</p>
                      <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors">
                          {t.close}
                      </button>
                  </div>
              )}
          </div>
      </div>
  );
}
