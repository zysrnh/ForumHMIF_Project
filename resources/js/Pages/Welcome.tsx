import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    AspirationItem,
    addSharedAspiration,
    getAspirationStats,
    getSharedAspirations,
    subscribeAspirations,
    toggleVoteSharedAspiration,
} from '@/data/aspirations';

// Hook deteksi scroll mekanikal
function useScrollReveal(threshold = 0.12) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold },
        );

        const currentEl = ref.current;
        if (currentEl) {
            observer.observe(currentEl);
        }

        return () => {
            if (currentEl) {
                observer.unobserve(currentEl);
            }
        };
    }, [threshold]);

    return { ref, isVisible };
}

// Hook Counting Angka Dinamis (dari 0 ke target)
function useCountUp(target: number, duration: number = 1200) {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        if (target === 0) {
            setCount(0);
            return;
        }

        let startTimestamp: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic curve
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [target, duration]);

    return count;
}

// Helper Inisial Nama
function getInitials(name: string): string {
    if (!name) return 'IF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion?: string; phpVersion?: string }>) {
    // State Store Aspirasi Sinkron Realtime (Bersama Dashboard)
    const [sharedList, setSharedList] = useState<AspirationItem[]>([]);

    useEffect(() => {
        setSharedList(getSharedAspirations());
        const unsubscribe = subscribeAspirations((updated) => {
            setSharedList(updated);
        });
        return unsubscribe;
    }, []);

    // Metrik Dinamis yang Dihitung dari Data Realtime
    const stats = getAspirationStats(sharedList);

    // State Mini Form Aspirasi Hero
    const [aspirationCategory, setAspirationCategory] = useState<string>('Fasilitas & Lab');
    const [aspirationContent, setAspirationContent] = useState<string>('');
    const [recommendToKsm, setRecommendToKsm] = useState<boolean>(true);
    const [aspirationSuccess, setAspirationSuccess] = useState<boolean>(false);

    // State Interaktif Alur Garis Stepper Cara Kerja Forum
    const [activeStep, setActiveStep] = useState<number>(1);

    // Observer untuk scroll reveal sections
    const topicsSection = useScrollReveal();
    const caraKerjaSection = useScrollReveal();

    // Animated Counters (Langsung berjalan sesuai data aktual)
    const countAspirasi = useCountUp(stats.total, 1200);
    const countTopikKsm = useCountUp(stats.ksmCount, 1000);
    const countProker = useCountUp(stats.actionCount, 900);

    // Fungsi Smooth Scroll Halus Tanpa Teleport Tiba-tiba
    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Data Langkah Alur Stepper (Interactive Line)
    const workflowSteps = [
        {
            step: 1,
            number: '01',
            shortTitle: 'Tulis Aspirasi',
            badge: 'Kanal Terbuka',
            title: 'Tulis Aspirasi Bebas & Terbuka',
            desc: 'Mahasiswa IF dapat menyampaikan ide proker, saran akademik, atau kritik sarana lab komputasi secara bebas, transparan, atau anonim melalui form aspirasi.',
            actionHint: 'Kategori tersedia: Akademik & Kurikulum, Fasilitas & Lab, Kegiatan & Proker, dan Advokasi.',
            tagBg: 'bg-hima-blue-dark text-white',
            borderColor: 'border-hima-blue-dark',
        },
        {
            step: 2,
            number: '02',
            shortTitle: 'Dukungan & Vote',
            badge: 'Dukungan Massal',
            title: 'Mahasiswa Bersuara Lewat Upvote',
            desc: 'Setiap aspirasi yang terkirim langsung tampil di radar forum untuk didukung sesama mahasiswa. Topik dengan suara tertinggi akan otomatis naik prioritas.',
            actionHint: 'Satu suara dari kalian menentukan apa yang diangkat ke rapat pimpinan himpunan.',
            tagBg: 'bg-hima-red-light text-white',
            borderColor: 'border-hima-red-light',
        },
        {
            step: 3,
            number: '03',
            shortTitle: 'Meja KSM & Proker',
            badge: 'Eksekusi Nyata',
            title: 'Bahas di Sidang KSM & Wujudkan Jadi Proker',
            desc: 'Pengurus HIMA IF mengkaji topik teratas dalam agenda Sidang Pleno KSM (Kelompok Studi Mahasiswa), menerbitkan nomor berkas pleno, lalu menjadikannya proker nyata.',
            actionHint: 'Hasil resolusi dan keputusan pleno dipublikasikan terbuka di dashboard & halaman topik.',
            tagBg: 'bg-hima-blue-light text-white',
            borderColor: 'border-hima-blue-light',
        },
    ];

    // Topik Lagi Rame: Diambil dari sharedList dan diurutkan berdasarkan vote terbanyak
    const topTopics = [...sharedList].sort((a, b) => b.votes - a.votes).slice(0, 3);

    // Vote Realtime yang Terhubung Langsung ke Store Global
    const handleVote = (id: number) => {
        toggleVoteSharedAspiration(id);
    };

    // Quick Submit dari Hero Section Langsung Terhubung ke Dashboard
    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aspirationContent.trim()) return;

        const title =
            aspirationContent.length > 55
                ? aspirationContent.slice(0, 52) + '...'
                : aspirationContent;

        const currentAuthor = auth.user ? auth.user.name : 'Mahasiswa IF';
        const currentNim =
            auth.user && 'nim' in auth.user
                ? (auth.user as { nim?: string }).nim || '240414***'
                : '240414***';

        addSharedAspiration({
            title,
            category: aspirationCategory,
            content: aspirationContent,
            authorName: currentAuthor,
            authorNim: currentNim,
            isAnonymous: !auth.user,
            status: recommendToKsm ? 'ksm' : 'baru',
            isKsmAgenda: recommendToKsm,
        });

        setAspirationContent('');
        setAspirationSuccess(true);
        setTimeout(() => setAspirationSuccess(false), 3500);
    };

    const currentStepData = workflowSteps.find((s) => s.step === activeStep) || workflowSteps[0];

    return (
        <>
            <Head title="Forum HMIF - Suara Kalian, Arah KSM Kita" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 xl:p-10 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">
                {/* Ambient Floating Geometric Accents */}
                <div className="hidden xl:block absolute top-6 left-4 2xl:left-10 w-12 h-12 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-6 z-0" />
                <div className="hidden xl:block absolute top-[20rem] left-3 2xl:left-8 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2 -rotate-12 z-0" />
                <div className="hidden xl:block absolute top-[42rem] left-4 2xl:left-10 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-3 z-0" />

                <div className="hidden xl:block absolute top-8 right-4 2xl:right-10 w-14 h-14 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-2 -rotate-6 z-0" />
                <div className="hidden xl:block absolute top-[21rem] right-3 2xl:right-8 w-11 h-11 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-12 z-0" />
                <div className="hidden xl:block absolute top-[43rem] right-5 2xl:right-10 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2 -rotate-3 z-0" />

                {/* Main Wrapper */}
                <div className="w-full max-w-7xl 2xl:max-w-[1440px] z-10 space-y-10 my-2">
                    {/* 1. NAVBAR FORUM (Drop Slam Animation) */}
                    <header className="anim-brutal-drop bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between gap-4">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm group-hover:rotate-[-4deg] transition-transform duration-200">
                                <img
                                    src="/logo/logo.png"
                                    alt="Logo HIMA IF"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="font-black text-hima-blue-dark tracking-tight text-base sm:text-xl block leading-none">
                                    FORUM HMIF
                                </span>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Suara Mahasiswa IF &bull; Agenda KSM
                                </span>
                            </div>
                        </Link>

                        {/* Menu Nav Santai */}
                        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-bold uppercase tracking-wider text-hima-blue-dark">
                            <a
                                href="#aspirasi"
                                onClick={(e) => scrollToSection(e, 'aspirasi')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Aspirasi
                            </a>
                            <Link
                                href={route('topik.index')}
                                className="hover:text-hima-red-light transition-colors flex items-center gap-1"
                            >
                                <span>Topik Rame</span>
                                <span className="text-[9px] bg-hima-red-light text-white px-1.5 py-0.2 font-black">
                                    HOT
                                </span>
                            </Link>
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Cara Kerja KSM
                            </a>
                        </nav>

                        {/* Right Auth Button */}
                        <div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-blue-dark text-white font-bold px-4 sm:px-6 py-2.5 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] text-xs uppercase tracking-wider hover:bg-hima-blue-light"
                                >
                                    Dashboard Kamu
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-red-light text-white font-black px-5 sm:px-7 py-2.5 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Gabung Yuk
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* 2. HERO SECTION: INDIKATOR DI ATAS HEADLINE SUARA + FORM ASPIRASI */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        {/* Kiri: Indikator Tepat di Atas Kata "Suara" + Headline & CTA */}
                        <div className="anim-brutal-stamp-left lg:col-span-7 bg-white border-2 border-hima-blue-dark p-6 sm:p-9 shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover space-y-6">
                            <div className="space-y-6">
                                {/* INDIKATOR STATISTIK: Aspirasi Masuk, Topik di KSM, Proker */}
                                <div className="grid grid-cols-3 border-2 border-hima-blue-dark bg-blue-50/40 divide-x-2 divide-hima-blue-dark shadow-[3px_3px_0px_0px_#1A467C]">
                                    <div className="p-2 sm:p-3 text-center">
                                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-hima-blue-dark block font-mono leading-none">
                                            {countAspirasi}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                            Aspirasi Masuk
                                        </span>
                                    </div>
                                    <div className="p-2 sm:p-3 text-center">
                                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-hima-red-light block font-mono leading-none">
                                            {countTopikKsm}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                            Topik di KSM
                                        </span>
                                    </div>
                                    <div className="p-2 sm:p-3 text-center">
                                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-hima-blue-light block font-mono leading-none">
                                            {countProker}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                            Proker
                                        </span>
                                    </div>
                                </div>

                                {/* Headline "Suara Kalian, Arah KSM Kita." */}
                                <div className="space-y-3">
                                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-hima-blue-dark tracking-tight leading-tight">
                                        Suara Kalian, Arah KSM Kita.
                                    </h1>

                                    <p className="text-base sm:text-lg font-medium text-gray-700 leading-relaxed max-w-2xl">
                                        Ruang terbuka buat anak IF tumpahin unek-unek, usul ide kegiatan, sampai nentuin topik bahasan sidang pleno KSM himpunan bareng-bareng.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons dengan Smooth Scroll */}
                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <a
                                    href="#form-aspirasi"
                                    onClick={(e) => scrollToSection(e, 'form-aspirasi')}
                                    className="btn-brutal inline-flex items-center justify-center bg-hima-red-light text-white font-black px-7 py-3.5 border-2 border-hima-blue-dark shadow-[5px_5px_0px_0px_#1A467C] text-sm sm:text-base uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Kirim Aspirasi
                                </a>
                                <Link
                                    href={route('topik.index')}
                                    className="btn-brutal inline-flex items-center justify-center bg-white text-hima-blue-dark font-bold px-6 py-3.5 border-2 border-hima-blue-dark shadow-[5px_5px_0px_0px_#1A467C] text-sm sm:text-base uppercase tracking-wider hover:bg-blue-50"
                                >
                                    Lihat Topik Lagi Rame &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Kanan: Mini Form Aspirasi Langsung */}
                        <div
                            id="form-aspirasi"
                            className="anim-brutal-stamp-right lg:col-span-5 bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover"
                        >
                            <form onSubmit={handleQuickSubmit} className="space-y-4">
                                <div className="border-b-2 border-hima-blue-dark pb-2.5 flex items-center justify-between">
                                    <h2 className="text-base font-black text-hima-blue-dark uppercase tracking-wider">
                                        Tumpahin Aspirasimu
                                    </h2>
                                    <span className="text-[10px] font-bold bg-hima-blue-light text-white px-2 py-0.5 border border-hima-blue-dark uppercase">
                                        Publik &bull; Live Sync
                                    </span>
                                </div>

                                {/* Segment / Category Chips */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-600 block uppercase">
                                        Kategori Topik:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Fasilitas & Lab', 'Akademik & Kurikulum', 'Kegiatan & Proker', 'Advokasi'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setAspirationCategory(cat)}
                                                className={`text-xs font-bold px-3 py-1 border-2 border-hima-blue-dark transition-all duration-150 ${
                                                    aspirationCategory === cat
                                                        ? 'bg-hima-blue-dark text-white shadow-[3px_3px_0px_0px_#1A467C] translate-x-[-1px] translate-y-[-1px]'
                                                        : 'bg-white text-hima-blue-dark hover:bg-gray-100'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Textarea Input */}
                                <div className="space-y-1">
                                    <textarea
                                        rows={4}
                                        value={aspirationContent}
                                        onChange={(e) => setAspirationContent(e.target.value)}
                                        placeholder="Tulis unek-unek, usulan event, atau saran lab di sini..."
                                        className="w-full border-2 border-hima-blue-dark p-3 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light resize-none rounded-none shadow-brutal-sm"
                                    />
                                </div>

                                {/* Checkbox Agenda KSM */}
                                <label className="flex items-center gap-2.5 bg-red-50/70 border border-hima-red-light p-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={recommendToKsm}
                                        onChange={(e) => setRecommendToKsm(e.target.checked)}
                                        className="w-4 h-4 rounded-none border-2 border-hima-red-light text-hima-red-light focus:ring-0 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-bold text-hima-red-dark">
                                        Rekomendasikan langsung ke Sidang Pleno KSM HMIF
                                    </span>
                                </label>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full btn-brutal bg-hima-red-light text-white font-black py-3 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Lempar ke Forum & KSM
                                </button>

                                {aspirationSuccess && (
                                    <div className="p-2.5 bg-green-50 border-2 border-green-700 text-green-900 text-xs font-bold text-center">
                                        Aspirasi kamu berhasil masuk ke daftar topik & tersinkron ke dashboard!
                                    </div>
                                )}
                            </form>

                            <p className="text-[11px] text-gray-500 font-medium text-center pt-3">
                                Setiap suara akan dikurasi dan dibahas dalam agenda rapat pleno KSM HIMA IF.
                            </p>
                        </div>
                    </section>

                    {/* 3. TOPIK LAGI RAME (TERSINKRON REALTIME DENGAN DASHBOARD) */}
                    <section
                        id="aspirasi"
                        ref={topicsSection.ref}
                        className="space-y-5"
                    >
                        <div className="border-b-2 border-hima-blue-dark pb-2.5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                    Topik Lagi Rame
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                    Aspirasi terhangat dengan dukungan vote terbanyak dari anak IF (sinkron realtime).
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-[11px] font-bold text-hima-blue-dark bg-white border border-hima-blue-dark px-2.5 py-1 uppercase tracking-wider shadow-brutal-sm">
                                    Data Tersinkron
                                </span>
                                <Link
                                    href={route('topik.index')}
                                    className="text-[11px] font-black text-white bg-hima-blue-dark px-3 py-1 uppercase tracking-wider border-2 border-hima-blue-dark shadow-brutal-sm hover:bg-hima-blue-light transition-all active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    Buka Halaman Topik &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* List Topik (Grid 3 Kolom Proporsional) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                            {topTopics.map((item, index) => {
                                const snapClass =
                                    index === 0
                                        ? 'spring-snap-1'
                                        : index === 1
                                        ? 'spring-snap-2'
                                        : 'spring-snap-3';

                                const tiltTransform =
                                    topicsSection.isVisible
                                        ? 'translate-y-0 scale-100 rotate-0'
                                        : index === 0
                                        ? 'translate-y-8 scale-[0.98]'
                                        : index === 1
                                        ? 'translate-y-10 scale-[0.98]'
                                        : 'translate-y-8 scale-[0.98]';

                                const borderTopColor =
                                    index === 0
                                        ? 'border-t-4 border-t-hima-red-light'
                                        : index === 1
                                        ? 'border-t-4 border-t-hima-blue-dark'
                                        : 'border-t-4 border-t-hima-blue-light';

                                const isKsm = item.status === 'ksm' || item.isKsmAgenda;

                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white border-2 border-hima-blue-dark ${borderTopColor} p-6 shadow-[6px_6px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover space-y-4 relative ${snapClass} ${tiltTransform}`}
                                    >
                                        <div className="space-y-3.5">
                                            {/* Tag & Status Badge Khusus Tiap Card */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#1A467C]">
                                                        {item.category}
                                                    </span>
                                                    {index === 0 && (
                                                        <span className="text-[10px] font-black uppercase tracking-wide bg-hima-red-light text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_#1A467C]">
                                                            TOP #1
                                                        </span>
                                                    )}
                                                </div>

                                                {isKsm ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 bg-red-50 text-hima-red-light border-hima-red-light">
                                                        {item.ksmDocketNumber || 'AGENDA KSM'}
                                                    </span>
                                                ) : item.status === 'tindak_lanjut' ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 bg-sky-50 text-hima-blue-light border-hima-blue-light">
                                                        PROKER
                                                    </span>
                                                ) : item.status === 'kurasi' ? (
                                                    <span className="text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 bg-blue-50 text-hima-blue-dark border-hima-blue-dark">
                                                        KURASI ADVOKASI
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 bg-gray-100 text-gray-800 border-gray-400">
                                                        BARU MASUK
                                                    </span>
                                                )}
                                            </div>

                                            {/* Judul Topik */}
                                            <h3 className="text-base sm:text-lg font-black text-hima-blue-dark leading-snug line-clamp-2">
                                                {item.title}
                                            </h3>

                                            {/* Deskripsi */}
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-3 leading-relaxed">
                                                {item.content}
                                            </p>

                                            {/* KSM Schedule Note */}
                                            {item.ksmPlenoSchedule && (
                                                <div className="p-2 bg-red-50/60 border border-red-200 text-[10px] font-semibold text-hima-red-dark">
                                                    Sidang: {item.ksmPlenoSchedule}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Kartu: Inisial Avatar Penulis, Komentar & Tombol Vote */}
                                        <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 border border-hima-blue-dark bg-hima-blue-dark text-white flex items-center justify-center font-black text-[11px] shadow-[1px_1px_0px_0px_#1A467C]">
                                                    {getInitials(item.authorName)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-800 leading-none">
                                                        {item.isAnonymous ? 'Anonim' : item.authorName}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                                                        {item.createdAt}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.comments && item.comments.length > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 px-1.5 py-1">
                                                        {item.comments.length} pesan
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleVote(item.id)}
                                                    className={`btn-brutal inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-hima-blue-dark transition-all ${
                                                        item.hasVoted
                                                            ? 'bg-hima-red-light text-white shadow-[3px_3px_0px_0px_#1A467C]'
                                                            : 'bg-white text-hima-blue-dark hover:bg-gray-100 shadow-[3px_3px_0px_0px_#1A467C]'
                                                    }`}
                                                >
                                                    <span>&#9650;</span>
                                                    <span>{item.votes}</span>
                                                    <span className="text-[10px] uppercase font-bold">Vote</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 4. CARA KERJA FORUM: GARIS ALUR INTERAKTIF (TIMELINE STEPPER) */}
                    <section
                        id="cara-kerja"
                        ref={caraKerjaSection.ref}
                        className="space-y-6"
                    >
                        <div className="border-b-2 border-hima-blue-dark pb-2.5">
                            <h2 className="text-2xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Cara Kerja Forum & Sidang KSM
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Garis alur transparan dari unek-unek kamu sampai jadi berkas sidang pleno KSM dan proker nyata himpunan. Tekan tiap tahap untuk melihat detailnya.
                            </p>
                        </div>

                        {/* Kartu Garis Alur Interaktif */}
                        <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1A467C] space-y-8">
                            <div className="relative">
                                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-hima-blue-dark -translate-y-1/2 z-0" />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                                    {workflowSteps.map((s) => {
                                        const isCurrent = activeStep === s.step;
                                        return (
                                            <button
                                                key={s.step}
                                                type="button"
                                                onClick={() => setActiveStep(s.step)}
                                                className={`text-left p-3.5 sm:p-4 border-2 border-hima-blue-dark transition-all duration-150 flex items-center justify-between gap-3 ${
                                                    isCurrent
                                                        ? 'bg-hima-blue-dark text-white shadow-[4px_4px_0px_0px_#1A467C] -translate-y-1'
                                                        : 'bg-white text-hima-blue-dark hover:bg-blue-50 shadow-[2px_2px_0px_0px_#1A467C]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`w-8 h-8 border-2 border-hima-blue-dark flex items-center justify-center font-black text-xs ${
                                                            isCurrent
                                                                ? 'bg-hima-red-light text-white'
                                                                : 'bg-blue-50 text-hima-blue-dark'
                                                        }`}
                                                    >
                                                        {s.number}
                                                    </span>
                                                    <div>
                                                        <span className="text-xs sm:text-sm font-black uppercase tracking-wide block leading-tight">
                                                            {s.shortTitle}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 block ${
                                                                isCurrent ? 'text-blue-200' : 'text-gray-500'
                                                             }`}
                                                        >
                                                            {s.badge}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className={`text-xs font-black ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                                    {isCurrent ? '●' : '○'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Panel Detail Langkah yang Sedang Aktif */}
                            <div className="bg-blue-50/50 border-2 border-hima-blue-dark p-6 sm:p-7 shadow-[4px_4px_0px_0px_#1A467C] space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-hima-blue-dark/20 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 border border-hima-blue-dark bg-hima-blue-dark text-white text-[11px] font-black uppercase tracking-wider">
                                            Tahap {currentStepData.number}
                                        </span>
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            {currentStepData.badge}
                                        </span>
                                    </div>

                                    {/* Tombol Navigasi Stepper */}
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            type="button"
                                            disabled={activeStep === 1}
                                            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                                            aria-label="Tahap Sebelumnya"
                                            className="w-8 h-8 border-2 border-hima-blue-dark bg-white flex items-center justify-center text-hima-blue-dark shadow-[2px_2px_0px_0px_#1A467C] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none hover:bg-gray-100 transition-all"
                                        >
                                            <svg
                                                className="w-4 h-4 stroke-[2.5]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={activeStep === 3}
                                            onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
                                            aria-label="Tahap Selanjutnya"
                                            className="w-8 h-8 border-2 border-hima-blue-dark bg-white flex items-center justify-center text-hima-blue-dark shadow-[2px_2px_0px_0px_#1A467C] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none hover:bg-gray-100 transition-all"
                                        >
                                            <svg
                                                className="w-4 h-4 stroke-[2.5]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-black text-hima-blue-dark">
                                        {currentStepData.title}
                                    </h3>
                                    <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed max-w-3xl">
                                        {currentStepData.desc}
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
                                    <span className="w-2 h-2 bg-hima-red-light inline-block" />
                                    <span>{currentStepData.actionHint}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. FOOTER SANTAI & BERSIH */}
                    <footer className="border-t-2 border-hima-blue-dark pt-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-gray-600">
                        <div>
                            <p className="font-bold text-hima-blue-dark text-sm sm:text-base">
                                Dibuat anak IF, buat anak IF.
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Forum HMIF &bull; Himpunan Mahasiswa Teknik Informatika &bull; Kelompok Studi Mahasiswa (KSM)
                            </p>
                        </div>

                        <div className="text-xs font-bold text-hima-blue-dark uppercase tracking-wider">
                            &copy; 2026 HIMA IF &bull; All Rights Reserved
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
