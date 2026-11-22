import React, { useEffect, useState } from 'react';
import { Download, Share2, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  const handleInstall = async () => {
    if (isIOS && !deferredPrompt) {
      setShowIOSModal(true);
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#C59326]/50 bg-[#F7F2E4] dark:bg-amber-500/15 text-[#9A6D12] dark:text-amber-300 text-xs font-medium hover:bg-[#EFE4C8] transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-sm w-full rounded-xl bg-white dark:bg-[#0D1326] border border-[#C59326]/30 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300">
                Install GOO ASTROLOGY
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              On iPhone / iPad Safari: tap the <Share2 className="inline w-3.5 h-3.5 mx-0.5" />{' '}
              <strong>Share</strong> icon in the toolbar, then choose{' '}
              <strong>&quot;Add to Home Screen&quot;</strong> to use all Vedic calculators offline.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
      <WifiOff className="w-3 h-3" />
      <span>Offline Engine Active</span>
    </span>
  );
}
