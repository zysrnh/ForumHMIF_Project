import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState<boolean>(false);
    const [isIos, setIsIos] = useState<boolean>(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

    useEffect(() => {
        // Cek apakah sudah berjalan dalam mode standalone (sudah terinstall)
        const checkStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);

        if (checkStandalone) {
            setIsStandalone(true);
            return;
        }

        // Cek apakah user pernah dismiss baru-baru ini (misal dalam 3 hari)
        const dismissedAt = localStorage.getItem('hmif_pwa_dismissed_at');
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 3) {
                return;
            }
        }

        // Deteksi iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

        if (isIosDevice && isSafari) {
            setIsIos(true);
            // Beri jeda 2.5 detik agar user sempat melihat halaman dulu
            const timer = setTimeout(() => setShowPrompt(true), 2500);
            return () => clearTimeout(timer);
        }

        // Handler untuk browser Chromium (Desktop Chrome/Edge, Android Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Beri jeda 2 detik agar tidak langsung menabrak user saat pertama kali load
            setTimeout(() => {
                setShowPrompt(true);
            }, 2000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            setShowIosGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        } catch (err) {
            console.error('Error triggering PWA install:', err);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('hmif_pwa_dismissed_at', Date.now().toString());
    };

    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <aside
            role="dialog"
            aria-label="Pasang Aplikasi HMIF"
            className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-[calc(100%-1.5rem)] anim-pwa-popup"
        >
            <div className="bg-white border-2 border-hima-blue-dark shadow-[5px_5px_0px_0px_#1A467C] p-4 text-black relative">
                {/* Header Popup */}
                <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-xs shrink-0 flex items-center justify-center">
                            <img
                                src="/logo/logo.png"
                                alt="Logo HMIF"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-hima-blue-dark text-xs sm:text-sm tracking-tight leading-tight truncate">
                                    Aplikasi Forum HMIF
                                </span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-hima-red-dark block">
                                Pasang ke Desktop & HP
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Tutup"
                        className="text-gray-400 hover:text-black font-mono text-sm font-black p-0.5"
                    >
                        ✕
                    </button>
                </div>

                {/* Deskripsi */}
                <p className="text-[11px] font-medium text-gray-700 leading-relaxed mt-2.5">
                    Buka Forum Aspirasi & KSM lebih cepat, lancar, dan praktis langsung dari beranda HP atau desktop kamu.
                </p>

                {/* Petunjuk Khusus iOS Safari jika diklik */}
                {showIosGuide && (
                    <div className="mt-2.5 p-2 bg-blue-50 border border-hima-blue-dark text-[11px] font-bold text-hima-blue-dark space-y-1">
                        <div className="flex items-center gap-1">
                            <span>1. Tekan tombol Bagikan</span>
                            <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>di Safari</span>
                        </div>
                        <p>2. Gulir ke bawah lalu pilih &apos;Tambah ke Layar Utama&apos;.</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="px-2.5 py-1.5 text-[11px] font-bold uppercase text-gray-600 hover:text-black transition-colors"
                    >
                        Nanti Saja
                    </button>
                    <button
                        type="button"
                        onClick={handleInstallClick}
                        className="btn-brutal inline-flex items-center gap-1.5 bg-hima-blue-dark text-white font-black px-3.5 py-1.5 text-[11px] uppercase tracking-wider border-2 border-hima-blue-dark shadow-brutal-xs hover:bg-hima-blue-light transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{isIos ? 'Cara Pasang' : 'Pasang Sekarang'}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
