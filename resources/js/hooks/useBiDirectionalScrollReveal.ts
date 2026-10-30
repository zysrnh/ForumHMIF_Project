import { useEffect } from 'react';

/**
 * Hook universal untuk scroll reveal 2 arah (masuk & keluar saat scroll ke atas atau bawah).
 * Memantau semua elemen berkelas `.scroll-reveal`, `.scroll-reveal-left`, `.scroll-reveal-right`.
 */
export function useBiDirectionalScrollReveal(threshold = 0.12) {
    useEffect(() => {
        const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                    } else {
                        // Ketika keluar dari viewport (scroll ke atas atau ke bawah), reset animasi
                        // Cek posisi agar saat di paling atas tidak terlempar
                        const rect = entry.target.getBoundingClientRect();
                        // Reset jika elemen memang sudah melewati batas atas atau bawah layar
                        if (rect.top > window.innerHeight || rect.bottom < 0) {
                            entry.target.classList.remove('is-revealed');
                        }
                    }
                });
            },
            {
                threshold,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, [threshold]);
}
