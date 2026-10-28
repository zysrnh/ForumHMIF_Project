import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface TopicItem {
    id: number;
    title: string;
    description: string;
    tag: string;
    author: string;
    timeAgo: string;
    votes: number;
    hasVoted?: boolean;
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

    // State Topik Lagi Rame (Interactive Votes)
    const [topics, setTopics] = useState<TopicItem[]>([
        {
            id: 1,
            title: 'Pendingin & Spek PC Lab Komputasi Perlu Upgrade buat Matkul AI',
            description: 'Suhu lab sering overheat kalau mahasiswa training model lokal pas praktikum kecerdasan buatan. Usul bawa ke rapat KSM buat diajuin ke prodi.',
            tag: 'TK',
            author: 'Anak Tingkat Akhir',
            timeAgo: '2 jam lalu',
            votes: 84,
            hasVoted: false,
        },
        {
            id: 2,
            title: 'Request Bimbingan & Mentoring Struktur Data dari Kakak Tingkat',
            description: 'Banyak maba yang keteteran di pointer dan graph. Pengen ada sesi klinik koding mingguan yang dibimbing divisi ristek HIMA.',
            tag: 'Maba',
            author: 'Mahasiswa 2026',
            timeAgo: '5 jam lalu',
            votes: 67,
            hasVoted: false,
        },
        {
            id: 3,
            title: 'Adain Hackathon Internal IF dengan Tema AI Agents & Web Modern',
            description: 'Biar portofolio anak IF makin nendang buat magang, usul KSM bikin event hackathon 24 jam di kampus.',
            tag: 'Umum',
            author: 'Fullstack Enthusiast',
            timeAgo: '1 hari lalu',
            votes: 53,
            hasVoted: false,
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

        // Tambahkan aspirasi baru ke list
        const newTopic: TopicItem = {
            id: Date.now(),
            title: aspirationContent.slice(0, 60) + (aspirationContent.length > 60 ? '...' : ''),
            description: aspirationContent,
            tag: aspirationCategory,
            author: 'Kamu (Baru saja)',
            timeAgo: 'Barusan',
            votes: 1,
            hasVoted: true,
        };

        setTopics([newTopic, ...topics]);
        setAspirationContent('');
        setAspirationSuccess(true);
        setTimeout(() => setAspirationSuccess(false), 3500);
    };

    return (
        <>
            <Head title="Forum HMIF - Suara Kalian, Arah KSM Kita" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">
                {/* Floating Geometric Accents */}
                <div className="hidden md:block absolute top-8 left-8 w-14 h-14 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
                <div className="hidden md:block absolute bottom-16 left-12 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2" />
                <div className="hidden md:block absolute top-24 right-12 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-2" />

                {/* Main Wrapper */}
                <div className="w-full max-w-5xl z-10 space-y-10 my-2">
                    {/* 1. NAVBAR FORUM */}
                    <header className="bg-white border-2 border-hima-blue-dark p-3.5 sm:p-4 shadow-brutal flex items-center justify-between gap-4">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm group-hover:rotate-[-3deg] transition-transform">
                                <img
                                    src="/logo/logo.png"
                                    alt="Logo HIMA IF"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="font-black text-hima-blue-dark tracking-tight text-base sm:text-lg block leading-none">
                                    FORUM HMIF
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Suara Mahasiswa IF
                                </span>
                            </div>
                        </Link>

                        {/* Menu Nav Santai */}
                        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-hima-blue-dark">
                            <a href="#aspirasi" className="hover:text-hima-blue-light transition-colors">
                                Aspirasi
                            </a>
                            <a href="#cara-kerja" className="hover:text-hima-blue-light transition-colors">
                                Cara Kerja
                            </a>
                            <a href="#warta" className="hover:text-hima-blue-light transition-colors">
                                Warta
                            </a>
                            <a href="#pengurus" className="hover:text-hima-blue-light transition-colors">
                                Buat Pengurus
                            </a>
                        </nav>

                        {/* Right Auth Button */}
                        <div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-blue-dark text-white font-bold px-4 py-2 border-2 border-hima-blue-dark shadow-brutal-sm text-xs uppercase tracking-wider hover:bg-hima-blue-light"
                                >
                                    Dashboard Kamu
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-red-light text-white font-black px-4 sm:px-5 py-2 border-2 border-hima-blue-dark shadow-brutal-sm text-xs uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Gabung Yuk
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* 2. HERO: SUARA KALIAN, ARAH KSM KITA + MINI FORM ASPIRASI */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Kiri: Headline & Call To Action */}
                        <div className="lg:col-span-7 bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="inline-block bg-blue-50 border border-hima-blue-light px-3 py-1 text-xs font-bold text-hima-blue-dark uppercase tracking-wider">
                                    Pintu Masuk Aspirasi Mahasiswa
                                </div>

                                <h1 className="text-3xl sm:text-5xl font-black text-hima-blue-dark tracking-tight leading-tight">
                                    Suara Kalian, Arah KSM Kita.
                                </h1>

                                <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed">
                                    Ruang terbuka buat anak IF tumpahin unek-unek, usul ide kegiatan, sampai nentuin topik bahasan himpunan bareng-bareng.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 flex flex-wrap items-center gap-3">
                                <a
                                    href="#form-aspirasi"
                                    className="btn-brutal inline-flex items-center justify-center bg-hima-red-light text-white font-black px-6 py-3 border-2 border-hima-blue-dark shadow-brutal text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Kirim Aspirasi
                                </a>
                                <a
                                    href="#aspirasi"
                                    className="btn-brutal inline-flex items-center justify-center bg-white text-hima-blue-dark font-bold px-5 py-3 border-2 border-hima-blue-dark shadow-brutal text-sm uppercase tracking-wider hover:bg-blue-50"
                                >
                                    Lihat Topik Masuk
                                </a>
                            </div>
                        </div>

                        {/* Kanan: Mini Form Aspirasi Langsung */}
                        <div
                            id="form-aspirasi"
                            className="lg:col-span-5 bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-brutal-lg flex flex-col justify-between"
                        >
                            <form onSubmit={handleQuickSubmit} className="space-y-3.5">
                                <div className="border-b-2 border-hima-blue-dark pb-2 flex items-center justify-between">
                                    <h2 className="text-sm font-black text-hima-blue-dark uppercase tracking-wider">
                                        Tumpahin Aspirasimu
                                    </h2>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5">
                                        Bisa Anonim
                                    </span>
                                </div>

                                {/* Segment / Category Chips */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-600 block uppercase">
                                        Kategori / Kamu Siapa:
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Umum', 'Maba', 'TK', 'Fasilitas Lab'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setAspirationCategory(cat)}
                                                className={`text-[11px] font-bold px-2.5 py-1 border-2 border-hima-blue-dark transition-all ${
                                                    aspirationCategory === cat
                                                        ? 'bg-hima-blue-dark text-white shadow-brutal-sm'
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
                                        rows={3}
                                        value={aspirationContent}
                                        onChange={(e) => setAspirationContent(e.target.value)}
                                        placeholder="Tulis unek-unek, usulan event, atau saran lab di sini..."
                                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light resize-none rounded-none shadow-brutal-sm"
                                    />
                                </div>

                                {/* Submit Button (Merah HIMA) */}
                                <button
                                    type="submit"
                                    className="w-full btn-brutal bg-hima-red-light text-white font-black py-2.5 border-2 border-hima-blue-dark shadow-brutal text-xs uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Lempar ke Forum
                                </button>

                                {aspirationSuccess && (
                                    <div className="p-2 bg-green-50 border-2 border-green-700 text-green-900 text-[11px] font-bold text-center">
                                        Aspirasi kamu berhasil masuk ke daftar topik!
                                    </div>
                                )}
                            </form>

                            <p className="text-[10px] text-gray-500 font-medium text-center pt-2">
                                Setiap suara akan dikurasi dan dibahas dalam rapat rutin KSM HIMA IF.
                            </p>
                        </div>
                    </section>

                    {/* 3. TOPIK LAGI RAME (3-5 KARTU ASPIRASI TERBANYAK) */}
                    <section id="aspirasi" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-hima-blue-dark pb-2">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-hima-blue-dark uppercase tracking-tight">
                                    Topik Lagi Rame
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                    Aspirasi dengan vote terbanyak yang lagi hangat diperbincangkan anak IF.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-hima-blue-dark bg-white border-2 border-hima-blue-dark px-3 py-1 shadow-brutal-sm self-start sm:self-auto uppercase">
                                Realtime Voting
                            </span>
                        </div>

                        {/* List Topik */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                            {topics.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border-2 border-hima-blue-dark p-5 shadow-brutal flex flex-col justify-between btn-brutal space-y-3"
                                >
                                    <div className="space-y-2.5">
                                        {/* Chip & Meta */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                                Chip: {item.tag}
                                            </span>
                                            <span className="text-[10px] font-semibold text-gray-500">
                                                {item.timeAgo}
                                            </span>
                                        </div>

                                        {/* Judul Topik */}
                                        <h3 className="text-base font-black text-hima-blue-dark leading-snug">
                                            {item.title}
                                        </h3>

                                        {/* Deskripsi */}
                                        <p className="text-xs font-medium text-gray-600 line-clamp-3">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Footer Kartu & Tombol Vote */}
                                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-gray-500">
                                            {item.author}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleVote(item.id)}
                                            className={`btn-brutal inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black border-2 border-hima-blue-dark transition-all ${
                                                item.hasVoted
                                                    ? 'bg-hima-red-light text-white shadow-brutal-sm'
                                                    : 'bg-white text-hima-blue-dark hover:bg-gray-100 shadow-brutal-sm'
                                            }`}
                                        >
                                            <span>&#9650;</span>
                                            <span>{item.votes}</span>
                                            <span className="text-[10px] uppercase font-bold">Vote</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. CARA KERJA (3 LANGKAH) */}
                    <section id="cara-kerja" className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg space-y-6">
                        <div className="text-center max-w-lg mx-auto space-y-1">
                            <h2 className="text-xl sm:text-2xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Cara Kerja Forum
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Dari sekadar unek-unek sampai jadi program dan solusi nyata di himpunan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {/* Langkah 1 */}
                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm space-y-2">
                                <div className="text-2xl font-black text-hima-blue-dark">01</div>
                                <h3 className="text-base font-black text-hima-blue-dark uppercase">
                                    Tulis Aspirasimu
                                </h3>
                                <p className="text-xs font-medium text-gray-600">
                                    Tumpahin ide kegiatan, saran akademik, atau kritik fasilitas lab secara terbuka atau anonim.
                                </p>
                            </div>

                            {/* Langkah 2 */}
                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm space-y-2">
                                <div className="text-2xl font-black text-hima-red-light">02</div>
                                <h3 className="text-base font-black text-hima-blue-dark uppercase">
                                    Dukungan & Vote
                                </h3>
                                <p className="text-xs font-medium text-gray-600">
                                    Ajak temen-temen seangkatan nge-vote aspirasimu biar naik ke jajaran topik prioritas.
                                </p>
                            </div>

                            {/* Langkah 3 */}
                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm space-y-2">
                                <div className="text-2xl font-black text-hima-blue-light">03</div>
                                <h3 className="text-base font-black text-hima-blue-dark uppercase">
                                    Dibahas di KSM
                                </h3>
                                <p className="text-xs font-medium text-gray-600">
                                    Topik teratas langsung dibawa ke meja rapat KSM HIMA IF buat dicariin solusi atau diangkat ke prodi.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. COUNTER STATISTIK */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border-2 border-hima-blue-dark p-5 shadow-brutal text-center">
                            <span className="text-3xl sm:text-4xl font-black text-hima-blue-dark block">
                                148
                            </span>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1 block">
                                Aspirasi Masuk
                            </span>
                        </div>

                        <div className="bg-white border-2 border-hima-blue-dark p-5 shadow-brutal text-center">
                            <span className="text-3xl sm:text-4xl font-black text-hima-red-light block">
                                42
                            </span>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1 block">
                                Topik Dibahas di KSM
                            </span>
                        </div>

                        <div className="bg-white border-2 border-hima-blue-dark p-5 shadow-brutal text-center">
                            <span className="text-3xl sm:text-4xl font-black text-hima-blue-light block">
                                23
                            </span>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1 block">
                                Jadi Program & Aksi
                            </span>
                        </div>
                    </section>

                    {/* 6. WARTA & ARTIKEL (Sebagai Pelengkap) */}
                    <section id="warta" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-hima-blue-dark pb-2">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-hima-blue-dark uppercase tracking-tight">
                                    Warta & Artikel Informatika
                                </h2>
                                <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                    Kumpulan bacaan teknologi, riset, dan info kegiatan mahasiswa IF.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-hima-blue-dark bg-white border-2 border-hima-blue-dark px-3 py-1 shadow-brutal-sm self-start sm:self-auto uppercase">
                                Baca Lainnya
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                            {/* Card Kiri */}
                            <div className="lg:col-span-7 bg-white border-2 border-hima-blue-dark p-5 shadow-brutal flex flex-col justify-between btn-brutal cursor-pointer">
                                <div className="space-y-3">
                                    <div className="w-full h-44 bg-slate-900 border-2 border-hima-blue-dark relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A467C]/90 to-[#2A82C6]/50 mix-blend-multiply" />
                                        <p className="relative z-10 text-white font-black text-lg sm:text-xl uppercase tracking-wider">
                                            AI & Software Engineering
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                            Riset & AI
                                        </span>
                                        <span className="text-xs font-semibold text-gray-500">
                                            28 Oktober 2026
                                        </span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-hima-blue-dark leading-snug">
                                        Pemanfaatan Large Language Model untuk Otomasi Pelayanan Mahasiswa
                                    </h3>
                                    <p className="text-xs font-medium text-gray-600 line-clamp-2">
                                        Kajian implementasi AI agent cerdas untuk memvalidasi berkas akademik dan portal kemahasiswaan.
                                    </p>
                                </div>
                            </div>

                            {/* List Kanan */}
                            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                                <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal flex-1 btn-brutal cursor-pointer space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                            Web Dev & UI
                                        </span>
                                        <span className="text-[10px] font-semibold text-gray-500">26 Okt</span>
                                    </div>
                                    <h4 className="text-sm font-black text-hima-blue-dark leading-snug">
                                        Eksplorasi Konsep Neubrutalism dalam Desain Portal Mahasiswa
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        Kenapa warna solid dan shadow kaku justru bikin navigasi makin jelas.
                                    </p>
                                </div>

                                <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal flex-1 btn-brutal cursor-pointer space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                            Agenda POKJA
                                        </span>
                                        <span className="text-[10px] font-semibold text-gray-500">24 Okt</span>
                                    </div>
                                    <h4 className="text-sm font-black text-hima-blue-dark leading-snug">
                                        Workshop Pemrograman Cloud & Persiapan Karir Developer 2026
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        Dokumentasi sesi bimbingan teknis bersama praktisi software house.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. STRIP "BUAT PENGURUS" (Kompak Satu Baris) */}
                    <section id="pengurus" className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 font-black text-hima-blue-dark uppercase tracking-wide">
                            <span className="w-2.5 h-2.5 bg-hima-blue-dark" />
                            <span>Area Pengurus HIMA IF:</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-gray-700">
                            <Link
                                href={route('login')}
                                className="px-2.5 py-1 border border-gray-300 hover:border-hima-blue-dark hover:bg-blue-50 uppercase text-[11px]"
                            >
                                Surat & Arsip
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-2.5 py-1 border border-gray-300 hover:border-hima-blue-dark hover:bg-blue-50 uppercase text-[11px]"
                            >
                                Database Anggota
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-2.5 py-1 border border-gray-300 hover:border-hima-blue-dark hover:bg-blue-50 uppercase text-[11px]"
                            >
                                Agenda POKJA
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-2.5 py-1 border border-gray-300 hover:border-hima-blue-dark hover:bg-blue-50 uppercase text-[11px]"
                            >
                                Kas HIMA
                            </Link>
                            <Link
                                href={route('login')}
                                className="btn-brutal px-3 py-1 bg-hima-blue-dark text-white font-black border-2 border-hima-blue-dark shadow-brutal-sm uppercase text-[11px] ml-1"
                            >
                                Masuk Admin
                            </Link>
                        </div>
                    </section>

                    {/* 8. FOOTER SANTAI */}
                    <footer className="border-t-2 border-hima-blue-dark pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-gray-600">
                        <div>
                            <p className="font-bold text-hima-blue-dark text-sm">
                                Dibuat anak IF, buat anak IF.
                            </p>
                            <p className="text-[11px] text-gray-500">
                                Forum HMIF &bull; Himpunan Mahasiswa Teknik Informatika
                            </p>
                        </div>

                        <div className="text-gray-400 font-mono text-[10px]">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
