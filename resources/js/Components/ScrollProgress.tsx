import { useEffect, useState } from 'react';

export default function ScrollProgress() {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let ticking = false;

        const updateScrollProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollHeight > 0) {
                const scrolled = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
                setProgress(scrolled);
            } else {
                setProgress(0);
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateScrollProgress();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 h-1 sm:h-1.5 z-[100] pointer-events-none bg-slate-200/50"
        >
            <div
                className="h-full bg-hima-red-dark border-b border-hima-blue-dark/30 transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
