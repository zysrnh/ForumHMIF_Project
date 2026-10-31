import { useEffect } from 'react';

/**
 * Hook universal scroll reveal bi-directional (masuk & keluar saat scroll ke atas atau bawah).
 * Menggunakan real-time scroll tracking + initial check agar kartu TIDAK PERNAH tersangkut pudar di layar.
 */
export function useBiDirectionalScrollReveal() {
    useEffect(() => {
        const updateElements = () => {
            const elements = document.querySelectorAll<HTMLElement>('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
            if (!elements.length) return;

            const vh = window.innerHeight || document.documentElement.clientHeight;

            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                // Kartu sedang berada di area tampilan yang terlihat (margin pandang responsif)
                const inView = rect.top < vh - 30 && rect.bottom > 30;

                if (inView) {
                    el.classList.add('is-revealed');
                } else if (rect.top > vh + 80 || rect.bottom < -80) {
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

        // Jalankan segera saat mount dan setelah render selesai agar kartu awal langsung muncul jelas
        updateElements();
        const t1 = setTimeout(updateElements, 60);
        const t2 = setTimeout(updateElements, 250);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);
}
