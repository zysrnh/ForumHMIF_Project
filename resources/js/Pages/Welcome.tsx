import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface TopicItem {
    id: number;
    title: string;
    description: string;
    tag: string;
    statusBadge: string;
    statusColor: string;
    avatarInitials: string;
    avatarBg: string;
    author: string;
    timeAgo: string;
    votes: number;
    hasVoted?: boolean;
    isTop?: boolean;
    borderTopColor: string;
}

// Hook deteksi scroll mekanikal (responsif scroll atas & bawah)
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
function useCountUp(target: number, duration: number = 1300, isStarted: boolean = true) {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        if (!isStarted) return;
        let startTimestamp: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic curve untuk feel mekanikal mantap
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
    }, [target, duration, isStarted]);

    return count;
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    // State Mini Form Aspirasi Hero
    const [aspirationCategory, setAspirationCategory] = useState<string>('Umum');
    const [aspirationContent, setAspirationContent] = useState<string>('');
    const [aspirationSuccess, setAspirationSuccess] = useState<boolean>(false);

    // Observer untuk scroll reveal sections
    const indicatorSection = useScrollReveal();
    const topicsSection = useScrollReveal();
    const caraKerjaSection = useScrollReveal();

    // Animated Counters (Dijalankan saat halaman load atau section terlihat)
    const countAspirasi = useCountUp(148, 1400, indicatorSection.isVisible);
    const countTopikKsm = useCountUp(42, 1200, indicatorSection.isVisible);
    const countProgramAksi = useCountUp(23, 1100, indicatorSection.isVisible);

    // State Topik Lagi Rame (Variatif & Tidak Monoton)
    const [topics, setTopics] = useState<TopicItem[]>([
        {
            id: 1,
            title: 'Pendingin & Spek PC Lab Komputasi Perlu Upgrade buat Matkul AI',
            description: 'Suhu lab sering overheat kalau mahasiswa training model lokal pas praktikum kecerdasan buatan. Usul bawa ke rapat KSM buat diajuin ke prodi.',
            tag: 'TK',
            statusBadge: '🔥 Siap Masuk KSM',
            statusColor: 'bg-red-50 text-hima-red-light border-hima-red-light',
            avatarInitials: 'TA',
            avatarBg: 'bg-hima-blue-dark text-white',
            author: 'Anak Tingkat Akhir',
            timeAgo: '2 jam lalu',
            votes: 84,
            hasVoted: true,
            isTop: true,
            borderTopColor: 'border-t-4 border-t-hima-red-light',
        },
        {
            id: 2,
            title: 'Request Bimbingan & Mentoring Struktur Data dari Kakak Tingkat',
            description: 'Banyak maba yang keteteran di pointer dan graph. Pengen ada sesi klinik koding mingguan yang dibimbing divisi ristek HIMA.',
            tag: 'Maba',
            statusBadge: 'Tahap Kurasi Ristek',
            statusColor: 'bg-blue-50 text-hima-blue-dark border-hima-blue-dark',
            avatarInitials: 'M26',
            avatarBg: 'bg-hima-red-light text-white',
            author: 'Mahasiswa 2026',
            timeAgo: '5 jam lalu',
            votes: 67,
            hasVoted: false,
            isTop: false,
            borderTopColor: 'border-t-4 border-t-hima-blue-dark',
        },
        {
            id: 3,
            title: 'Adain Hackathon Internal IF dengan Tema AI Agents & Web Modern',
            description: 'Biar portofolio anak IF makin nendang buat magang, usul KSM bikin event hackathon 24 jam di kampus bareng mentor alumni.',
            tag: 'Umum',
            statusBadge: 'Diskusi Terbuka',
            statusColor: 'bg-sky-50 text-hima-blue-light border-hima-blue-light',
            avatarInitials: 'FE',
            avatarBg: 'bg-hima-blue-light text-white',
            author: 'Fullstack Enthusiast',
            timeAgo: '1 hari lalu',
            votes: 53,
            hasVoted: false,
            isTop: false,
            borderTopColor: 'border-t-4 border-t-hima-blue-light',
        },
    ]);

    const handleVote = (id: number) => {
        setTopics((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    const newVotes = t.hasVoted ? t.votes - 1 : t.votes + 1;
                    return { ...t, votes: newVotes, hasVoted: !t.hasVoted };
                }
                return t;
            }),
        );
    };

    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aspirationContent.trim()) return;

        const newTopic: TopicItem = {
            id: Date.now(),
            title: aspirationContent.slice(0, 60) + (aspirationContent.length > 60 ? '...' : ''),
            description: aspirationContent,
            tag: aspirationCategory,
            statusBadge: 'Baru Masuk',
            statusColor: 'bg-gray-100 text-gray-800 border-gray-400',
            avatarInitials: 'ME',
            avatarBg: 'bg-hima-blue-dark text-white',
            author: 'Kamu (Barusan)',
            timeAgo: 'Barusan',
            votes: 1,
            hasVoted: true,
            isTop: false,
            borderTopColor: 'border-t-4 border-t-hima-blue-dark',
        };

        setTopics([newTopic, ...topics]);
        setAspirationContent('');
        setAspirationSuccess(true);
        setTimeout(() => setAspirationSuccess(false), 3500);
    };

    return (
        <>
            <Head title="Forum HMIF - Suara Kalian, Arah KSM Kita" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 xl:p-10 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">
                {/* Ambient Floating Geometric Accents (Sisi Kiri Layar - Posisinya Tidak Menabrak Judul / Footer) */}
                <div className="hidden xl:block absolute top-6 left-4 2xl:left-10 w-12 h-12 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-6 z-0" />
                <div className="hidden xl:block absolute top-[20rem] left-3 2xl:left-8 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2 -rotate-12 z-0" />
                <div className="hidden xl:block absolute top-[42rem] left-4 2xl:left-10 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-3 z-0" />
                <div className="hidden xl:block absolute top-[64rem] left-3 2xl:left-8 w-10 h-10 bg-hima-blue-dark/15 border-2 border-hima-blue-dark shadow-brutal-sm pointer-events-none anim-float-2 rotate-12 z-0" />

                {/* Ambient Floating Geometric Accents (Sisi Kanan Layar - Posisinya Aman) */}
                <div className="hidden xl:block absolute top-8 right-4 2xl:right-10 w-14 h-14 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-2 -rotate-6 z-0" />
                <div className="hidden xl:block absolute top-[21rem] right-3 2xl:right-8 w-11 h-11 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-12 z-0" />
                <div className="hidden xl:block absolute top-[43rem] right-5 2xl:right-10 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2 -rotate-3 z-0" />
                <div className="hidden xl:block absolute top-[65rem] right-4 2xl:right-10 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1 rotate-6 z-0" />

                {/* Main Wrapper (Widescreen Responsive Container) */}
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
                                    Suara Mahasiswa IF
                                </span>
                            </div>
                        </Link>

                        {/* Menu Nav Santai */}
                        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-bold uppercase tracking-wider text-hima-blue-dark">
                            <a href="#aspirasi" className="hover:text-hima-blue-light transition-colors">
                                Aspirasi
                            </a>
                            <a href="#cara-kerja" className="hover:text-hima-blue-light transition-colors">
                                Cara Kerja
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

                    {/* 2. HERO: SUARA KALIAN, ARAH KSM KITA + MINI FORM ASPIRASI */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        {/* Kiri: Headline & Call To Action (Anim Stamp Left) */}
                        <div className="anim-brutal-stamp-left lg:col-span-7 bg-white border-2 border-hima-blue-dark p-6 sm:p-10 shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover">
                            <div className="space-y-5">
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-hima-blue-dark tracking-tight leading-tight">
                                    Suara Kalian, Arah KSM Kita.
                                </h1>

                                <p className="text-base sm:text-lg font-medium text-gray-700 leading-relaxed max-w-2xl">
                                    Ruang terbuka buat anak IF tumpahin unek-unek, usul ide kegiatan, sampai nentuin topik bahasan himpunan bareng-bareng.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-8 flex flex-wrap items-center gap-4">
                                <a
                                    href="#form-aspirasi"
                                    className="btn-brutal inline-flex items-center justify-center bg-hima-red-light text-white font-black px-7 py-3.5 border-2 border-hima-blue-dark shadow-[5px_5px_0px_0px_#1A467C] text-sm sm:text-base uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Kirim Aspirasi
                                </a>
                                <a
                                    href="#aspirasi"
                                    className="btn-brutal inline-flex items-center justify-center bg-white text-hima-blue-dark font-bold px-6 py-3.5 border-2 border-hima-blue-dark shadow-[5px_5px_0px_0px_#1A467C] text-sm sm:text-base uppercase tracking-wider hover:bg-blue-50"
                                >
                                    Lihat Topik Masuk
                                </a>
                            </div>
                        </div>

                        {/* Kanan: Mini Form Aspirasi Langsung (Anim Stamp Right) */}
                        <div
                            id="form-aspirasi"
                            className="anim-brutal-stamp-right lg:col-span-5 bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover"
                        >
                            <form onSubmit={handleQuickSubmit} className="space-y-4">
                                <div className="border-b-2 border-hima-blue-dark pb-2.5">
                                    <h2 className="text-base font-black text-hima-blue-dark uppercase tracking-wider">
                                        Tumpahin Aspirasimu
                                    </h2>
                                </div>

                                {/* Segment / Category Chips */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-600 block uppercase">
                                        Kategori / Kamu Siapa:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Umum', 'Maba', 'TK', 'Fasilitas Lab'].map((cat) => (
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full btn-brutal bg-hima-red-light text-white font-black py-3 border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Lempar ke Forum
                                </button>

                                {aspirationSuccess && (
                                    <div className="p-2.5 bg-green-50 border-2 border-green-700 text-green-900 text-xs font-bold text-center">
                                        Aspirasi kamu berhasil masuk ke daftar topik!
                                    </div>
                                )}
                            </form>

                            <p className="text-[11px] text-gray-500 font-medium text-center pt-3">
                                Setiap suara akan dikurasi dan dibahas dalam rapat rutin KSM HIMA IF.
                            </p>
                        </div>
                    </section>

                    {/* 3. INDIKATOR STATISTIK DIPINDAHKAN KE ATAS DENGAN ANIMASI COUNTING */}
                    <section
                        ref={indicatorSection.ref}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6"
                    >
                        {/* Indikator 1: Aspirasi */}
                        <div
                            className={`bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between card-brutal-hover spring-snap-1 ${
                                indicatorSection.isVisible
                                    ? 'translate-y-0 scale-100'
                                    : 'translate-y-8 scale-95'
                            }`}
                        >
                            <div>
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-hima-blue-dark block font-mono">
                                    {countAspirasi}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                    Aspirasi Masuk
                                </span>
                            </div>
                            <div className="w-12 h-12 border-2 border-hima-blue-dark bg-blue-50 flex items-center justify-center font-black text-lg text-hima-blue-dark shadow-[2px_2px_0px_0px_#1A467C]">
                                💬
                            </div>
                        </div>

                        {/* Indikator 2: Topik KSM */}
                        <div
                            className={`bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between card-brutal-hover spring-snap-2 ${
                                indicatorSection.isVisible
                                    ? 'translate-y-0 scale-100'
                                    : 'translate-y-10 scale-95'
                            }`}
                        >
                            <div>
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-hima-red-light block font-mono">
                                    {countTopikKsm}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                    Topik Dibahas KSM
                                </span>
                            </div>
                            <div className="w-12 h-12 border-2 border-hima-blue-dark bg-red-50 flex items-center justify-center font-black text-lg text-hima-red-light shadow-[2px_2px_0px_0px_#1A467C]">
                                📋
                            </div>
                        </div>

                        {/* Indikator 3: Program & Aksi */}
                        <div
                            className={`bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between card-brutal-hover spring-snap-3 ${
                                indicatorSection.isVisible
                                    ? 'translate-y-0 scale-100'
                                    : 'translate-y-8 scale-95'
                            }`}
                        >
                            <div>
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-hima-blue-light block font-mono">
                                    {countProgramAksi}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider mt-1 block">
                                    Jadi Program & Aksi
                                </span>
                            </div>
                            <div className="w-12 h-12 border-2 border-hima-blue-dark bg-sky-50 flex items-center justify-center font-black text-lg text-hima-blue-light shadow-[2px_2px_0px_0px_#1A467C]">
                                🚀
                            </div>
                        </div>
                    </section>

                    {/* 4. TOPIK LAGI RAME (VARIATIF, TIDAK MONOTON & BERKARAKTER) */}
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
                                    Aspirasi terhangat dengan dukungan vote terbanyak dari anak IF.
                                </p>
                            </div>
                            <span className="text-[11px] font-bold text-hima-blue-dark bg-white border border-hima-blue-dark px-2.5 py-1 uppercase tracking-wider self-start sm:self-auto shadow-brutal-sm">
                                Realtime Trending
                            </span>
                        </div>

                        {/* List Topik (Variatif & Berkarakter Neubrutalism) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
                            {topics.map((item, index) => {
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
                                        ? 'translate-y-12 scale-[0.96] rotate-[-1.5deg]'
                                        : index === 1
                                        ? 'translate-y-16 scale-[0.96] rotate-0'
                                        : 'translate-y-12 scale-[0.96] rotate-[1.5deg]';

                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white border-2 border-hima-blue-dark ${item.borderTopColor} p-6 shadow-[6px_6px_0px_0px_#1A467C] flex flex-col justify-between card-brutal-hover space-y-4 relative ${snapClass} ${tiltTransform}`}
                                    >
                                        <div className="space-y-3.5">
                                            {/* Tag & Status Badge Khusus Tiap Card */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#1A467C]">
                                                        {item.tag}
                                                    </span>
                                                    {item.isTop && (
                                                        <span className="text-[10px] font-black uppercase tracking-wide bg-hima-red-light text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_#1A467C]">
                                                            TOP #1
                                                        </span>
                                                    )}
                                                </div>

                                                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${item.statusColor}`}>
                                                    {item.statusBadge}
                                                </span>
                                            </div>

                                            {/* Judul Topik */}
                                            <h3 className="text-base sm:text-lg font-black text-hima-blue-dark leading-snug">
                                                {item.title}
                                            </h3>

                                            {/* Deskripsi */}
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-3 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Footer Kartu: Inisial Avatar Penulis & Tombol Vote */}
                                        <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 border border-hima-blue-dark ${item.avatarBg} flex items-center justify-center font-black text-[11px] shadow-[1px_1px_0px_0px_#1A467C]`}>
                                                    {item.avatarInitials}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-800 leading-none">
                                                        {item.author}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                                                        {item.timeAgo}
                                                    </span>
                                                </div>
                                            </div>

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
                                );
                            })}
                        </div>
                    </section>

                    {/* 5. CARA KERJA FORUM (WORKFLOW PIPELINE BERTAHAP, BUKAN KOTAK KEMBAR) */}
                    <section
                        id="cara-kerja"
                        ref={caraKerjaSection.ref}
                        className="space-y-6"
                    >
                        <div className="border-b-2 border-hima-blue-dark pb-2.5">
                            <h2 className="text-2xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Cara Kerja Forum
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Alur transparan dari unek-unek kamu sampai jadi aksi dan program nyata di himpunan.
                            </p>
                        </div>

                        {/* Pipeline Grid 3 Langkah Terhubung */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch">
                            {/* Langkah 01 - Input Terbuka */}
                            <div
                                className={`bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex flex-col justify-between space-y-5 card-brutal-hover spring-snap-1 relative ${
                                    caraKerjaSection.isVisible
                                        ? 'translate-y-0 scale-100 rotate-0'
                                        : 'translate-y-12 scale-[0.96] rotate-[-1deg]'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="px-3 py-1 border-2 border-hima-blue-dark bg-hima-blue-dark text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A467C]">
                                            01 / Tulis
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-dark px-2 py-0.5">
                                            Kanal Terbuka
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-hima-blue-dark uppercase">
                                        Tulis Aspirasimu
                                    </h3>

                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Tumpahin ide kegiatan, kritik sarana lab komputasi, atau usulan akademik secara terbuka maupun anonim.
                                    </p>

                                    {/* Mock Mini Terminal Box */}
                                    <div className="bg-gray-50 border-2 border-dashed border-hima-blue-dark/50 p-2.5 font-mono text-[11px] text-gray-600">
                                        <span className="text-hima-red-light font-bold">$ </span>
                                        <span>tulis-aspirasi --anonim</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Tahap Pengumpulan
                                    </span>
                                    <span className="text-xs font-black text-hima-blue-dark">
                                        &rarr; Lanjut Vote
                                    </span>
                                </div>
                            </div>

                            {/* Langkah 02 - Voting Massal */}
                            <div
                                className={`bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex flex-col justify-between space-y-5 card-brutal-hover spring-snap-2 relative ${
                                    caraKerjaSection.isVisible
                                        ? 'translate-y-0 scale-100 rotate-0'
                                        : 'translate-y-14 scale-[0.96] rotate-0'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="px-3 py-1 border-2 border-hima-blue-dark bg-hima-red-light text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A467C]">
                                            02 / Vote
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-hima-red-light bg-red-50 border border-hima-red-light px-2 py-0.5">
                                            Dukungan Massal
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-hima-blue-dark uppercase">
                                        Dukungan & Vote
                                    </h3>

                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Ajak temen seangkatan nge-upvote topikmu agar naik ke radar prioritas pengurus dan jadi pembahasan utama.
                                    </p>

                                    {/* Mini Brutal Progress Indicator */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase">
                                            <span>Ambang Batas KSM</span>
                                            <span className="text-hima-red-light font-black">84 Vote</span>
                                        </div>
                                        <div className="w-full h-3 border border-hima-blue-dark bg-gray-100 overflow-hidden">
                                            <div className="h-full bg-hima-red-light w-4/5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-hima-red-light uppercase tracking-wider">
                                        Filter Demokrasi
                                    </span>
                                    <span className="text-xs font-black text-hima-red-light">
                                        &rarr; Meja Rapat
                                    </span>
                                </div>
                            </div>

                            {/* Langkah 03 - Meja KSM & Aksi Konkret */}
                            <div
                                className={`bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] flex flex-col justify-between space-y-5 card-brutal-hover spring-snap-3 relative ${
                                    caraKerjaSection.isVisible
                                        ? 'translate-y-0 scale-100 rotate-0'
                                        : 'translate-y-12 scale-[0.96] rotate-[1deg]'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="px-3 py-1 border-2 border-hima-blue-dark bg-hima-blue-light text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A467C]">
                                            03 / Aksi
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-hima-blue-light bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                            Meja KSM
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-hima-blue-dark uppercase">
                                        Dibahas di KSM
                                    </h3>

                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Topik teratas langsung dibawa ke rapat KSM HIMA IF untuk dijadikan program kerja nyata atau diajukan ke prodi.
                                    </p>

                                    {/* Cap Stempel Resolusi */}
                                    <div className="border-2 border-hima-blue-dark bg-blue-50/70 p-2 text-center font-black text-[11px] text-hima-blue-dark uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A467C]">
                                        &#10003; Resolusi & Program Resmi
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-hima-blue-light uppercase tracking-wider">
                                        Eksekusi Nyata
                                    </span>
                                    <span className="text-xs font-black text-hima-blue-dark">
                                        &#9733; Solusi Konkret
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 6. FOOTER SANTAI & BERSIH */}
                    <footer className="border-t-2 border-hima-blue-dark pt-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-gray-600">
                        <div>
                            <p className="font-bold text-hima-blue-dark text-sm sm:text-base">
                                Dibuat anak IF, buat anak IF.
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Forum HMIF &bull; Himpunan Mahasiswa Teknik Informatika
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
