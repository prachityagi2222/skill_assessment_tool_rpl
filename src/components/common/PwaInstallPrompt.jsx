import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Info, X, ShieldAlert, CheckCircle, Monitor } from 'lucide-react';
import { Button } from './Button';

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isRunningStandalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner if not already installed and not dismissed this session
      const dismissed = sessionStorage.getItem('kaushalsetu_pwa_banner_dismissed');
      if (!dismissed && !isRunningStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!showGuideModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowGuideModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showGuideModal]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuideModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('kaushalsetu_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Subtle Floating Install Banner on Mobile/Desktop */}
      {showBanner && !isStandalone && (
        <div className="bg-teal-900/95 text-white backdrop-blur-md border-b border-teal-700/60 px-3.5 py-2 text-xs flex items-center justify-between shadow-md relative z-40 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center shrink-0 border border-teal-600/50">
              <Smartphone className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <p className="font-bold text-white text-xs leading-tight">Install KaushalSetu App</p>
              <p className="text-[11px] text-teal-200/90 leading-tight">Save drafts & conduct assessments offline in field camps</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-teal-900 hover:bg-teal-50 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-xs flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              title="Installation Guide"
              className="text-teal-300 hover:text-white p-1 rounded-lg"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              title="Dismiss"
              className="text-teal-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Trigger button for Header or footer menu to view offline/install info */}
      <button
        onClick={() => setShowGuideModal(true)}
        className="hidden"
        id="open-pwa-guide-trigger"
        aria-hidden="true"
      />

      {/* PWA & Offline Guidance Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-label="Offline Installation and Capabilities" className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center border border-teal-700">
                  <Smartphone className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Offline Installation & Capabilities</h3>
                  <p className="text-[11px] text-teal-200">Progressive Web App (PWA) Guidance</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                aria-label="Close offline installation guide"
                className="text-teal-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-700">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-900 block">Offline-Ready Architecture</span>
                  <span className="text-[11px] text-teal-800">
                    Application shell, core NQR qualifications, and assessment rubrics are cached automatically. You can launch and use KaushalSetu even without cellular network or Wi-Fi.
                  </span>
                </div>
              </div>

              {/* Browser-Specific Instructions */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-xs">How to Install by Device / Browser:</span>

                <div className="border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Monitor className="w-3.5 h-3.5 text-teal-600" />
                    <span>Android Chrome / Edge / Desktop Chrome</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Tap the <strong>"Install"</strong> button above or click the address bar install icon. The app will install as a standalone native-like icon on your home screen.
                  </p>
                  {deferredPrompt && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-1 w-full text-xs py-1"
                      onClick={handleInstallClick}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Install Now
                    </Button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                    <span>iOS Safari (iPhone / iPad)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Apple iOS requires manual addition: Tap the <strong>Share</strong> button (square with arrow up) at the bottom of Safari, scroll down, and tap <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              {/* Important Storage Disclosures */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Device Storage Limitations Notice</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  • <strong>Variability:</strong> Installation and offline storage duration vary by browser and operating system.<br/>
                  • <strong>Eviction Risk:</strong> If your phone runs critically low on storage, or if you clear browser website data/cookies, saved offline records may be evicted by the browser.<br/>
                  • <strong>Security:</strong> Drafts are encrypted in IndexedDB on this physical device. Do not use shared public cyber-café computers without clearing local data.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuideModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
