import { useEffect } from 'react';

/**
 * Hook universal scroll reveal bi-directional (masuk & keluar saat scroll ke atas atau bawah).
 * Menggunakan MutationObserver + real-time scroll tracking agar tab dinamis dan kartu TIDAK PERNAH tersangkut blank/pudar.
 */
export function useBiDirectionalScrollReveal(deps: any[] = []) {
    useEffect(() => {
        const updateElements = () => {
            const elements = document.querySelectorAll<HTMLElement>('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
            if (!elements.length) return;

            const vh = window.innerHeight || document.documentElement.clientHeight;

            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                // Kartu sedang berada di area tampilan yang terlihat (margin pandang responsif)
                const inView = rect.top < vh - 20 && rect.bottom > 20;

                if (inView) {
                    el.classList.add('is-revealed');
                } else if (rect.top > vh + 100 || rect.bottom < -100) {
                    // Ketika kartu keluar dari layar saat di-scroll lewat (animasi keluar halus)
                    el.classList.remove('is-revealed');
                }
            });
        };

        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateElements();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Jalankan segera saat mount dan setelah render selesai agar konten langsung muncul jelas
        updateElements();
        const t1 = setTimeout(updateElements, 30);
        const t2 = setTimeout(updateElements, 120);
        const t3 = setTimeout(updateElements, 300);

        // Pantau mutasi DOM (misal pergantian tab React, filter search, dsb)
        const observer = new MutationObserver(() => {
            onScroll();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('popstate', onScroll, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('popstate', onScroll);
        };
    }, deps);
}
