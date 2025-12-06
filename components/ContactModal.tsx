

import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import type { ContactModalProps } from '../types';

export function ContactModal({ isOpen, onClose, selectedPackage, locale }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
      if (isOpen) {
          setIsSuccess(false);
          setIsProcessing(false);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      // Simulate Inquiry Processing
      setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
      }, 1500);
  };

  const t = {
      en: {
          title: 'Request Strategic Access',
          subtitle: 'Initialize your transformation protocol inquiry.',
          orderSummary: 'Selected Module',
          email: 'Business Email',
          pay: 'Submit Request',
          processing: 'Encrypting Request...',
          secure: 'Secure Business Channel',
          successTitle: 'Request Received',
          successMsg: 'Your inquiry has been logged. An Eidosense strategist will contact you shortly.',
          close: 'Close Console'
      },
      me: {
          title: 'Zahtjev za Strateški Pristup',
          subtitle: 'Inicijalizujte upit za protokol transformacije.',
          orderSummary: 'Odabrani Modul',
          email: 'Poslovni Email',
          pay: 'Pošalji Zahtjev',
          processing: 'Šifrovanje Zahtjeva...',
          secure: 'Siguran Poslovni Kanal',
          successTitle: 'Zahtjev Primljen',
          successMsg: 'Vaš upit je evidentiran. Eidosense strateg će vas uskoro kontaktirati.',
          close: 'Zatvori Konzolu'
      },
      tr: {
          title: 'Stratejik Erişim Talebi',
          subtitle: 'Dönüşüm protokolü talebinizi başlatın.',
          orderSummary: 'Seçilen Modül',
          email: 'İş E-postası',
          pay: 'Talebi Gönder',
          processing: 'Talep Şifreleniyor...',
          secure: 'Güvenli İş Kanalı',
          successTitle: 'Talep Alındı',
          successMsg: 'Talebiniz kaydedildi. Bir Eidosense stratejisti kısa süre içinde sizinle iletişime geçecek.',
          close: 'Konsolu Kapat'
      }
  }[locale];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-lg relative shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-2 text-cyan-400">
                      <Lock className="w-4 h-4" />
                      <span className="font-mono text-xs font-bold tracking-widest uppercase">{t.title}</span>
                  </div>
                  <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              {!isSuccess ? (
                  <div className="p-6 space-y-6">
                      {/* Selection Summary */}
                      <div className="bg-slate-900 rounded border border-slate-800 p-4">
                          <h4 className="text-xs uppercase text-slate-500 font-bold mb-3 tracking-wider">{t.orderSummary}</h4>
                          {selectedPackage && (
                              <div className="flex justify-between items-center">
                                  <div>
                                      <div className="text-white font-bold text-lg">{selectedPackage.name}</div>
                                      <div className="text-xs text-cyan-400 font-mono">
                                          Strategic Consultation
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Inquiry Form */}
                      <form onSubmit={handleCheckout} className="space-y-4">
                          <div>
                              <label className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">{t.email}</label>
                              <input 
                                  type="email" 
                                  required
                                  placeholder="name@company.com"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                              />
                          </div>

                          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 py-2">
                              <ShieldCheck className="w-3 h-3 text-green-500" />
                              {t.secure}
                          </div>

                          <button 
                              type="submit"
                              disabled={isProcessing}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {isProcessing ? (
                                  <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      {t.processing}
                                  </>
                              ) : (
                                  <>
                                    {t.pay} <ArrowRight className="w-4 h-4" />
                                  </>
                              )}
                          </button>
                      </form>
                  </div>
              ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                      <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-in zoom-in duration-300">
                          <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{t.successTitle}</h3>
                      <p className="text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">{t.successMsg}</p>
                      <button onClick={onClose} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors w-full">
                          {t.close}
                      </button>
                  </div>
              )}
          </div>
      </div>
  );
}