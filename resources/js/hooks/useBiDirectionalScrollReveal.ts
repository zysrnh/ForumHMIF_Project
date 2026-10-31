import { useEffect } from 'react';

/**
 * Hook universal untuk scroll reveal 2 arah yang atraktif & responsif.
 * Memastikan konten tidak pernah hilang/blank di layar HP (anti-blank viewport check).
 */
export function useBiDirectionalScrollReveal(threshold = 0.02) {
    useEffect(() => {
        const elements = document.querySelectorAll<HTMLElement>('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
        if (!elements.length) return;

        // Inisialisasi cepat: Elemen yang sudah ada di dalam atau dekat viewport langsung diberi animasi aktif
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < viewportHeight + 150 && rect.bottom > -100) {
                el.classList.add('is-revealed');
            }
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                    } else {
                        // Hanya reset animasi jika kartu sudah benar-benar jauh meninggalkan layar
                        const rect = entry.target.getBoundingClientRect();
                        if (rect.top > viewportHeight + 200 || rect.bottom < -200) {
                            entry.target.classList.remove('is-revealed');
                        }
                    }
                });
            },
            {
                threshold,
                rootMargin: '120px 0px 80px 0px',
            }
        );

        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, [threshold]);
}

