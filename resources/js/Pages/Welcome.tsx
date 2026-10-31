import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ScrollProgress from '@/Components/ScrollProgress';
import PwaInstallPrompt from '@/Components/PwaInstallPrompt';
import { useBiDirectionalScrollReveal } from '@/hooks/useBiDirectionalScrollReveal';
import {
    APP_CATEGORIES,
    AspirationItem,
    addSharedAspiration,
    fetchAspirationsFromServer,
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
        fetchAspirationsFromServer().then((items) => {
            setSharedList(items);
        });
        const unsubscribe = subscribeAspirations((updated) => {
            setSharedList(updated);
        });
        return unsubscribe;
    }, []);

    // Metrik Dinamis yang Dihitung dari Data Realtime
    const stats = getAspirationStats(sharedList);

    // State Mini Form Aspirasi Hero
    const [aspirationCategory, setAspirationCategory] = useState<string>('Akademik & Praktikum');
    const [aspirationAuthorName, setAspirationAuthorName] = useState<string>(auth?.user?.name || '');
    const [aspirationAuthorNim, setAspirationAuthorNim] = useState<string>(
        (auth?.user && 'nim' in auth.user && (auth.user as { nim?: string }).nim) ||
        (auth?.user?.email?.includes('@') ? auth.user.email.split('@')[0] : '')
    );
    const [aspirationAuthorClass, setAspirationAuthorClass] = useState<string>('');
    const [aspirationContent, setAspirationContent] = useState<string>('');
    const [aspirationSuccess, setAspirationSuccess] = useState<boolean>(false);

    // State Interaktif Alur Garis Stepper Cara Kerja Forum
    const [activeStep, setActiveStep] = useState<number>(1);

    // Hook Universal Scroll Reveal Bi-directional (masuk & keluar saat scroll naik / turun)
    useBiDirectionalScrollReveal();

    // Observer untuk scroll reveal sections
    const topicsSection = useScrollReveal();
    const caraKerjaSection = useScrollReveal();


    // Animated Counters (Langsung berjalan sesuai data aktual)
    const countAspirasi = useCountUp(stats.total, 1200);
    const countTotalVote = useCountUp(sharedList.reduce((sum, item) => sum + item.votes, 0), 1000);

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
            desc: 'Mahasiswa IF dapat menyampaikan ide, usulan akademik, atau keluhan sarana lab secara mudah, baik dengan identitas publik maupun mode anonim.',
            actionHint: 'Kategori tersedia: Akademik, Fasilitas Lab, Proker, Advokasi, dan Karier.',
            tagBg: 'bg-hima-blue-dark text-white',
            borderColor: 'border-hima-blue-dark',
        },
        {
            step: 2,
            number: '02',
            shortTitle: 'Dukungan & Vote',
            badge: 'Suara Bersama',
            title: 'Mahasiswa Bersuara Lewat Upvote',
            desc: 'Aspirasi yang dikirim langsung tampil di forum dan dapat didukung oleh rekan mahasiswa lain lewat tombol upvote.',
            actionHint: 'Aspirasi dengan vote tertinggi menjadi prioritas utama perhatian pengurus himpunan.',
            tagBg: 'bg-hima-red-light text-white',
            borderColor: 'border-hima-red-light',
        },
        {
            step: 3,
            number: '03',
            shortTitle: 'Tindak Lanjut & Aksi',
            badge: 'Eksekusi Nyata',
            title: 'Tindak Lanjut & Wujudkan Jadi Solusi',
            desc: 'Pengurus HIMA IF mengkaji aspirasi mahasiswa, berkoordinasi dengan pihak program studi, dan merealisasikan usulan menjadi aksi nyata.',
            actionHint: 'Pembaruan dan tanggapan resmi pengurus dapat dipantau langsung di forum.',
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

    // Quick Submit dari Hero Section
    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aspirationContent.trim()) return;

        const title =
            aspirationContent.length > 55
                ? aspirationContent.slice(0, 52) + '...'
                : aspirationContent;

        const currentAuthor = aspirationAuthorName.trim() || (auth.user ? auth.user.name : 'Mahasiswa IF');
        const currentNim =
            aspirationAuthorNim.trim() ||
            (auth.user && 'nim' in auth.user
                ? (auth.user as { nim?: string }).nim || '250414***'
                : '250414***');
        const currentClass = aspirationAuthorClass.trim();

        addSharedAspiration({
            title,
            category: aspirationCategory,
            content: aspirationContent,
            authorName: currentAuthor,
            authorNim: currentNim,
            authorClass: currentClass || undefined,
            isAnonymous: !aspirationAuthorName.trim() && !auth.user,
            status: 'baru',
        });

        // Kirim email notifikasi ke admin info@hmif-lpkia.my.id dan ke mahasiswa jika ada email
        try {
            fetch(route('aspirasi.notify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    title,
                    content: aspirationContent,
                    category: aspirationCategory,
                    authorName: currentAuthor,
                    authorNim: currentNim,
                    authorClass: currentClass,
                    authorEmail: auth.user?.email,
                }),
            }).catch(() => {});
        } catch (_) {}

        setAspirationContent('');
        if (!auth.user) {
            setAspirationAuthorName('');
            setAspirationAuthorNim('');

            setAspirationAuthorClass('');
        }
        setAspirationSuccess(true);
        setTimeout(() => setAspirationSuccess(false), 3500);
    };

    const currentStepData = workflowSteps.find((s) => s.step === activeStep) || workflowSteps[0];

    return (
        <>
            <Head title="Forum HMIF - Suara Mahasiswa Teknik Informatika" />

            {/* Indikator Garis Scroll Progress Bar */}
            <ScrollProgress />

            {/* Banner Pop-up Instalasi PWA ke Desktop / Layar HP */}
            <PwaInstallPrompt />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-2.5 sm:p-6 lg:p-8 xl:p-10 pb-20 md:pb-8 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">

                {/* Main Wrapper dengan jarak vertikal lega antar section agar animasi scroll reveal terasa mengalir */}
                <div className="w-full max-w-7xl 2xl:max-w-[1440px] z-10 space-y-12 sm:space-y-16 lg:space-y-24 my-2 sm:my-4">
                    {/* 1. NAVBAR FORUM */}
                    <header className="anim-brutal-drop bg-white border-2 border-hima-blue-dark p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#1A467C] sm:shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between gap-3 sm:gap-4">
                        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm group-hover:rotate-[-4deg] transition-transform duration-200 shrink-0">
                                <img
                                    src="/logo/logo.png"
                                    alt="Logo HIMA IF"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="min-w-0">
                                <span className="font-black text-hima-blue-dark tracking-tight text-sm sm:text-xl block leading-none truncate">
                                    FORUM HMIF
                                </span>
                                <span className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest block mt-0.5 truncate">
                                    Suara Mahasiswa Informatika
                                </span>
                            </div>
                        </Link>

                        {/* Menu Nav Desktop */}
                        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-bold uppercase tracking-wider text-hima-blue-dark">
                            <a
                                href="#aspirasi"
                                onClick={(e) => scrollToSection(e, 'aspirasi')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Aspirasi
                            </a>
                            <Link
                                href={route('topik.index')}
                                className="hover:text-hima-red-light transition-colors"
                            >
                                Topik
                            </Link>
                            <Link
                                href={route('ksm.survey.index')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Survei KSM
                            </Link>
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Cara Kerja
                            </a>
                        </nav>

                        {/* Right Auth Button */}
                        <div className="shrink-0">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-blue-dark text-white font-bold px-3.5 sm:px-6 py-2 sm:py-2.5 border-2 border-hima-blue-dark shadow-[3px_3px_0px_0px_#1A467C] sm:shadow-[4px_4px_0px_0px_#1A467C] text-[11px] sm:text-xs uppercase tracking-wider hover:bg-hima-blue-light"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-red-light text-white font-black px-3.5 sm:px-7 py-2 sm:py-2.5 border-2 border-hima-blue-dark shadow-[3px_3px_0px_0px_#1A467C] sm:shadow-[4px_4px_0px_0px_#1A467C] text-[11px] sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* 2. HERO SECTION */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
                        <div className="scroll-reveal lg:col-span-7 bg-white border-2 border-hima-blue-dark p-4 sm:p-9 shadow-[6px_6px_0px_0px_#1A467C] sm:shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover space-y-6">
                            <div className="space-y-5 sm:space-y-6">
                                {/* INDIKATOR STATISTIK BERSIH PENUH (FULL WIDTH & SIMETRIS TANPA SISA CELAH) */}
                                <div className="w-full grid grid-cols-2 sm:grid-cols-3 border-2 border-hima-blue-dark bg-blue-50/40 divide-x-2 divide-hima-blue-dark shadow-[3px_3px_0px_0px_#1A467C]">
                                    <div className="p-2.5 sm:p-3 text-center">
                                        <span className="text-2xl sm:text-3xl font-black text-hima-blue-dark block font-mono leading-none">
                                            {countAspirasi}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                            Aspirasi Terkumpul
                                        </span>
                                    </div>
                                    <div className="p-2.5 sm:p-3 text-center">
                                        <span className="text-2xl sm:text-3xl font-black text-hima-red-light block font-mono leading-none">
                                            {countTotalVote}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                            Total Dukungan
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-center justify-center p-2.5 sm:p-3 text-center bg-blue-100/50">
                                        <span className="text-2xl sm:text-3xl font-black text-hima-blue-dark block font-mono leading-none">
                                            KSM
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-hima-red-dark uppercase tracking-wider mt-1 block">
                                            Survei Terbuka
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 sm:space-y-3">
                                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-hima-blue-dark tracking-tight leading-tight">
                                        Suara Kalian, Solusi Bersama.
                                    </h1>

                                    <p className="text-sm sm:text-lg font-medium text-gray-700 leading-relaxed max-w-2xl">
                                        Ruang terbuka mahasiswa Teknik Informatika untuk menyampaikan aspirasi, usulan fasilitas, dan ide kegiatan secara transparan, mudah, dan bebas ribet.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                                <a
                                    href="#form-aspirasi"
                                    onClick={(e) => scrollToSection(e, 'form-aspirasi')}
                                    className="flex-1 sm:flex-initial btn-brutal inline-flex items-center justify-center bg-hima-red-light text-white font-black px-5 sm:px-7 py-3 sm:py-3.5 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] sm:shadow-[5px_5px_0px_0px_#1A467C] text-xs sm:text-base uppercase tracking-wider hover:bg-hima-red-dark text-center"
                                >
                                    Kirim Aspirasi
                                </a>
                                <Link
                                    href={route('topik.index')}
                                    className="flex-1 sm:flex-initial btn-brutal inline-flex items-center justify-center bg-white text-hima-blue-dark font-bold px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] sm:shadow-[5px_5px_0px_0px_#1A467C] text-xs sm:text-base uppercase tracking-wider hover:bg-blue-50 text-center"
                                >
                                    Topik &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Kanan: Form Aspirasi Langsung Ringkas & Efisien */}
                        <div
                            id="form-aspirasi"
                            className="scroll-reveal stagger-1 lg:col-span-5 bg-white border-2 border-hima-blue-dark p-4 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] sm:shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover"
                        >
                            <form onSubmit={handleQuickSubmit} className="space-y-3.5 sm:space-y-4">
                                <div className="border-b-2 border-hima-blue-dark pb-2.5 flex items-center justify-between">
                                    <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase tracking-wider">
                                        Kirim Aspirasi Cepat
                                    </h2>
                                </div>

                                {/* Dropdown Kategori dari APP_CATEGORIES */}
                                <div className="space-y-1.5">
                                    <label htmlFor="aspiration-category-select" className="text-[11px] font-bold text-gray-700 block uppercase">
                                        Pilih Kategori:
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="aspiration-category-select"
                                            value={aspirationCategory}
                                            onChange={(e) => setAspirationCategory(e.target.value)}
                                            className="w-full border-2 border-hima-blue-dark bg-slate-50/50 p-2 text-xs font-semibold text-black focus:outline-none focus:border-hima-blue-light focus:bg-white rounded-none shadow-xs cursor-pointer appearance-none pr-8"
                                        >
                                            {APP_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-hima-blue-dark">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Identitas Mahasiswa (Nama, NIM, Kelas) */}
                                <div className="space-y-1.5 pt-1 border-t border-dashed border-gray-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-700 block uppercase mb-1">
                                                Nama Mahasiswa
                                            </label>
                                            <input
                                                type="text"
                                                value={aspirationAuthorName}
                                                onChange={(e) => setAspirationAuthorName(e.target.value)}
                                                placeholder="Nama lengkap..."
                                                className="w-full border-2 border-hima-blue-dark bg-slate-50/50 p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:bg-white rounded-none shadow-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-700 block uppercase mb-1">
                                                NIM
                                            </label>
                                            <input
                                                type="text"
                                                value={aspirationAuthorNim}
                                                onChange={(e) => setAspirationAuthorNim(e.target.value)}
                                                placeholder="Contoh: 250414010"
                                                className="w-full border-2 border-hima-blue-dark bg-slate-50/50 p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:bg-white rounded-none shadow-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-700 block uppercase mb-1">
                                                Kelas
                                            </label>
                                            <input
                                                type="text"
                                                value={aspirationAuthorClass}
                                                onChange={(e) => setAspirationAuthorClass(e.target.value)}
                                                placeholder="Contoh: 2IF01"
                                                className="w-full border-2 border-hima-blue-dark bg-slate-50/50 p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:bg-white rounded-none shadow-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Textarea Input */}
                                <div className="space-y-1">
                                    <textarea
                                        rows={4}
                                        value={aspirationContent}
                                        onChange={(e) => setAspirationContent(e.target.value)}
                                        placeholder="Tuliskan aspirasi, kebutuhan fasilitas, atau usulan kamu di sini..."
                                        className="w-full border-2 border-hima-blue-dark p-2.5 sm:p-3 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light resize-none rounded-none shadow-xs"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full btn-brutal bg-hima-red-light text-white font-black py-2.5 sm:py-3 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Kirim ke Forum
                                </button>

                                {aspirationSuccess && (
                                    <div className="p-2.5 bg-green-50 border-2 border-green-700 text-green-900 text-xs font-bold text-center">
                                        Aspirasi kamu berhasil dikirim ke forum mahasiswa!
                                    </div>
                                )}
                            </form>

                            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium text-center pt-2">
                                Setiap suara akan dipelajari dan ditindaklanjuti oleh tim HIMA IF.
                            </p>
                        </div>
                    </section>

                    {/* 3. TOPIK LAGI RAME */}
                    <section
                        id="aspirasi"
                        ref={topicsSection.ref}
                        className="space-y-6 pt-4 sm:pt-8"
                    >

                        <div className="border-b-2 border-slate-300 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                            <div>
                                <h2 className="text-xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                    Topik Paling Banyak Didukung
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                                    Aspirasi terkini dengan dukungan vote tertinggi dari rekan mahasiswa.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Link
                                    href={route('topik.index')}
                                    className="text-[11px] font-black text-white bg-hima-blue-dark px-3.5 py-1.5 uppercase tracking-wider border-2 border-hima-blue-dark shadow-brutal-xs hover:bg-hima-blue-light transition-all active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    Lihat Semua &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* List Topik */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 items-stretch">
                            {topTopics.map((item, index) => {
                                const borderTopColor =
                                    index === 0
                                        ? 'border-t-4 border-t-hima-red-light'
                                        : index === 1
                                        ? 'border-t-4 border-t-hima-blue-dark'
                                        : 'border-t-4 border-t-hima-blue-light';

                                return (
                                    <div
                                        key={item.id}
                                        className={`scroll-reveal stagger-${(index % 3) + 1} bg-white border-2 border-hima-blue-dark ${borderTopColor} p-4 sm:p-5 shadow-brutal-sm flex flex-col justify-between card-brutal-hover space-y-3.5`}
                                    >
                                        <div className="space-y-2.5">
                                            {/* Tag Kategori & Waktu */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5 shadow-xs">
                                                    {item.category}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {item.createdAt}
                                                </span>
                                            </div>

                                            {/* Judul Topik */}
                                            <h3 className="text-base sm:text-lg font-black text-hima-blue-dark leading-snug line-clamp-2">
                                                {item.title}
                                            </h3>

                                            {/* Deskripsi */}
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-3 leading-relaxed">
                                                {item.content}
                                            </p>
                                        </div>

                                        {/* Footer Kartu: Inisial Avatar Penulis & Tombol Vote */}
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 truncate max-w-[55%]">
                                                <div className="w-6 h-6 border border-hima-blue-dark bg-hima-blue-dark text-white flex items-center justify-center font-black text-[10px] shadow-xs shrink-0">
                                                    {getInitials(item.authorName)}
                                                </div>
                                                <div className="min-w-0 truncate">
                                                    <span className="text-xs font-bold text-gray-800 block truncate">
                                                        {item.isAnonymous ? 'Anonim' : item.authorName}
                                                    </span>
                                                    {item.authorClass && (
                                                        <span className="text-[9px] font-bold text-gray-500 font-mono block -mt-0.5 truncate">
                                                            {item.authorClass}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {item.comments && item.comments.length > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 px-1.5 py-1">
                                                        {item.comments.length}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleVote(item.id)}
                                                    className={`btn-brutal inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black border-2 border-hima-blue-dark transition-all ${
                                                        item.hasVoted
                                                            ? 'bg-hima-red-light text-white shadow-xs'
                                                            : 'bg-white text-hima-blue-dark hover:bg-gray-100 shadow-xs'
                                                    }`}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    <span>{item.votes}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 4. CARA KERJA FORUM: TIMELINE STEPPER */}
                    <section
                        id="cara-kerja"
                        ref={caraKerjaSection.ref}
                        className="space-y-6 pt-4 sm:pt-8"
                    >

                        <div className="border-b-2 border-hima-blue-dark pb-2.5">
                            <h2 className="text-xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Alur Penyampaian Aspirasi
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Proses transparan dari pengiriman aspirasi sampai ditindaklanjuti oleh pengurus himpunan.
                            </p>
                        </div>

                        {/* Kartu Garis Alur Interaktif */}
                        <div className="scroll-reveal bg-white border-2 border-hima-blue-dark p-4 sm:p-7 shadow-[5px_5px_0px_0px_#1A467C] sm:shadow-[6px_6px_0px_0px_#1A467C] space-y-5 sm:space-y-6">
                            <div className="relative">
                                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-hima-blue-dark -translate-y-1/2 z-0" />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 relative z-10">
                                    {workflowSteps.map((s) => {
                                        const isCurrent = activeStep === s.step;
                                        return (
                                            <button
                                                key={s.step}
                                                type="button"
                                                onClick={() => setActiveStep(s.step)}
                                                className={`text-left p-3 sm:p-3.5 border-2 border-hima-blue-dark transition-all duration-150 flex items-center justify-between gap-3 ${
                                                    isCurrent
                                                        ? 'bg-hima-blue-dark text-white shadow-[3px_3px_0px_0px_#1A467C] sm:shadow-[4px_4px_0px_0px_#1A467C] -translate-y-0.5'
                                                        : 'bg-white text-hima-blue-dark hover:bg-blue-50 shadow-[2px_2px_0px_0px_#1A467C]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className={`w-7 h-7 border-2 border-hima-blue-dark flex items-center justify-center font-black text-xs ${
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
                                                            className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 block ${
                                                                isCurrent ? 'text-blue-200' : 'text-gray-500'
                                                            }`}
                                                        >
                                                            {s.badge}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className={`w-2.5 h-2.5 border border-current ${isCurrent ? 'bg-white' : 'bg-transparent'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Panel Detail Langkah yang Sedang Aktif */}
                            <div className="scroll-reveal stagger-1 bg-blue-50/50 border-2 border-hima-blue-dark p-4 sm:p-6 shadow-[3px_3px_0px_0px_#1A467C] sm:shadow-[4px_4px_0px_0px_#1A467C] space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b-2 border-hima-blue-dark/20 pb-3">
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

                                <div className="space-y-1.5">
                                    <h3 className="text-base sm:text-xl font-black text-hima-blue-dark">
                                        {currentStepData.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed max-w-3xl">
                                        {currentStepData.desc}
                                    </p>
                                </div>

                                <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-gray-600">
                                    <span className="w-2 h-2 bg-hima-red-light inline-block" />
                                    <span>{currentStepData.actionHint}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. FOOTER */}
                    <footer className="border-t-2 border-hima-blue-dark pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-600">
                        <div>
                            <p className="font-bold text-hima-blue-dark text-sm sm:text-base">
                                Dibuat anak IF, buat anak IF.
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Forum HMIF &bull; Himpunan Mahasiswa Teknik Informatika
                            </p>
                        </div>

                        <div className="text-xs font-bold text-hima-blue-dark uppercase tracking-wider">
                            &copy; 2026 HIMA INFORMATIKA &bull; IDE LPKIA
                        </div>
                    </footer>
                </div>

                {/* ========================================================================= */}
                {/* 6. MOBILE APP BOTTOM NAVIGATION TOOLBAR                                   */}
                {/* ========================================================================= */}
                <nav
                    aria-label="Mobile app navigation toolbar"
                    className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-hima-blue-dark shadow-[0px_-4px_12px_rgba(26,70,124,0.15)] px-1 py-1"
                >
                    <div className="flex items-center justify-around gap-1 relative">
                        {/* 1. Beranda */}
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-hima-blue-dark font-black">
                                Beranda
                            </span>
                        </button>

                        {/* 2. Aspirasi */}
                        <a
                            href="#aspirasi"
                            onClick={(e) => scrollToSection(e, 'aspirasi')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-blue-dark font-bold">
                                Aspirasi
                            </span>
                        </a>

                        {/* 3. Topik Rame */}
                        <Link
                            href={route('topik.index')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-red-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-red-dark font-bold">
                                Topik
                            </span>
                        </Link>

                        {/* 4. Survei KSM */}
                        <Link
                            href={route('ksm.survey.index')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-blue-dark font-bold">
                                Survei KSM
                            </span>
                        </Link>

                        {/* 5. Akun / Masuk */}
                        <Link
                            href={auth.user ? route('dashboard') : route('login')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-blue-dark font-bold">
                                {auth.user ? 'Akun' : 'Masuk'}
                            </span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
