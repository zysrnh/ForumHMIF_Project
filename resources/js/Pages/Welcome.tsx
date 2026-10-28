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

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 xl:p-10 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">
                {/* Floating Geometric Accents di pojok atas */}
                <div className="hidden 2xl:block absolute top-8 left-8 w-14 h-14 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
                <div className="hidden 2xl:block absolute top-24 right-10 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-2" />

                {/* Main Wrapper (Widescreen Responsive Container) */}
                <div className="w-full max-w-7xl 2xl:max-w-[1440px] z-10 space-y-10 my-2">
                    {/* 1. NAVBAR FORUM */}
                    <header className="bg-white border-2 border-hima-blue-dark p-3.5 sm:p-5 shadow-brutal flex items-center justify-between gap-4">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm group-hover:rotate-[-3deg] transition-transform">
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
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-blue-dark text-white font-bold px-4 sm:px-6 py-2.5 border-2 border-hima-blue-dark shadow-brutal-sm text-xs uppercase tracking-wider hover:bg-hima-blue-light"
                                >
                                    Dashboard Kamu
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn-brutal inline-flex items-center gap-1.5 bg-hima-red-light text-white font-black px-5 sm:px-7 py-2.5 border-2 border-hima-blue-dark shadow-brutal-sm text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Gabung Yuk
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* 2. HERO: SUARA KALIAN, ARAH KSM KITA + MINI FORM ASPIRASI */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        {/* Kiri: Headline & Call To Action */}
                        <div className="lg:col-span-7 bg-white border-2 border-hima-blue-dark p-6 sm:p-10 shadow-brutal-lg flex flex-col justify-between">
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
                                    className="btn-brutal inline-flex items-center justify-center bg-hima-red-light text-white font-black px-7 py-3.5 border-2 border-hima-blue-dark shadow-brutal text-sm sm:text-base uppercase tracking-wider hover:bg-hima-red-dark"
                                >
                                    Kirim Aspirasi
                                </a>
                                <a
                                    href="#aspirasi"
                                    className="btn-brutal inline-flex items-center justify-center bg-white text-hima-blue-dark font-bold px-6 py-3.5 border-2 border-hima-blue-dark shadow-brutal text-sm sm:text-base uppercase tracking-wider hover:bg-blue-50"
                                >
                                    Lihat Topik Masuk
                                </a>
                            </div>
                        </div>

                        {/* Kanan: Mini Form Aspirasi Langsung */}
                        <div
                            id="form-aspirasi"
                            className="lg:col-span-5 bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg flex flex-col justify-between"
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
                                                className={`text-xs font-bold px-3 py-1 border-2 border-hima-blue-dark transition-all ${
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
                                    className="w-full btn-brutal bg-hima-red-light text-white font-black py-3 border-2 border-hima-blue-dark shadow-brutal text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark"
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

                    {/* 3. TOPIK LAGI RAME */}
                    <section id="aspirasi" className="space-y-5">
                        <div className="border-b-2 border-hima-blue-dark pb-2.5">
                            <h2 className="text-2xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Topik Lagi Rame
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Aspirasi dengan vote terbanyak yang lagi hangat diperbincangkan anak IF.
                            </p>
                        </div>

                        {/* List Topik (Grid 3 Kolom yang Melebar) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                            {topics.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border-2 border-hima-blue-dark p-6 shadow-brutal flex flex-col justify-between btn-brutal space-y-4"
                                >
                                    <div className="space-y-3">
                                        {/* Kategori & Waktu */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2.5 py-0.5">
                                                {item.tag}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-500">
                                                {item.timeAgo}
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

                                    {/* Footer Kartu & Tombol Vote */}
                                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">
                                            {item.author}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleVote(item.id)}
                                            className={`btn-brutal inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black border-2 border-hima-blue-dark transition-all ${
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

                    {/* 4. CARA KERJA FORUM (RAPI, BERSIH, SOLID WHITE) */}
                    <section id="cara-kerja" className="space-y-5">
                        <div className="border-b-2 border-hima-blue-dark pb-2.5">
                            <h2 className="text-2xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Cara Kerja Forum
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600">
                                Alur sederhana dari unek-unek kamu sampai jadi aksi dan program nyata di himpunan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                            {/* Langkah 1 */}
                            <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-brutal flex flex-col justify-between space-y-4 btn-brutal">
                                <div className="space-y-3">
                                    <div className="w-11 h-11 border-2 border-hima-blue-dark bg-hima-blue-dark text-white flex items-center justify-center font-black text-base shadow-brutal-sm">
                                        01
                                    </div>
                                    <h3 className="text-lg font-black text-hima-blue-dark uppercase">
                                        Tulis Aspirasimu
                                    </h3>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Tumpahin ide kegiatan, saran akademik, atau kritik fasilitas lab secara terbuka atau anonim langsung di form hero.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-gray-100 text-[11px] font-bold text-hima-blue-dark uppercase tracking-wider">
                                    Langkah Pertama
                                </div>
                            </div>

                            {/* Langkah 2 */}
                            <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-brutal flex flex-col justify-between space-y-4 btn-brutal">
                                <div className="space-y-3">
                                    <div className="w-11 h-11 border-2 border-hima-blue-dark bg-hima-red-light text-white flex items-center justify-center font-black text-base shadow-brutal-sm">
                                        02
                                    </div>
                                    <h3 className="text-lg font-black text-hima-blue-dark uppercase">
                                        Dukungan & Vote
                                    </h3>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Ajak temen-temen seangkatan nge-vote aspirasimu agar naik ke jajaran topik prioritas yang paling urgent.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-gray-100 text-[11px] font-bold text-hima-red-light uppercase tracking-wider">
                                    Dukungan Mahasiswa
                                </div>
                            </div>

                            {/* Langkah 3 */}
                            <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-7 shadow-brutal flex flex-col justify-between space-y-4 btn-brutal">
                                <div className="space-y-3">
                                    <div className="w-11 h-11 border-2 border-hima-blue-dark bg-hima-blue-light text-white flex items-center justify-center font-black text-base shadow-brutal-sm">
                                        03
                                    </div>
                                    <h3 className="text-lg font-black text-hima-blue-dark uppercase">
                                        Dibahas di KSM
                                    </h3>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                                        Topik teratas langsung dibawa ke meja rapat KSM HIMA IF buat dicarikan solusi konkret atau diangkat ke prodi.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-gray-100 text-[11px] font-bold text-hima-blue-light uppercase tracking-wider">
                                    Aksi Nyata Himpunan
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. COUNTER STATISTIK */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
                        <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal text-center">
                            <span className="text-4xl sm:text-5xl font-black text-hima-blue-dark block">
                                148
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mt-2 block">
                                Aspirasi Masuk
                            </span>
                        </div>

                        <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal text-center">
                            <span className="text-4xl sm:text-5xl font-black text-hima-red-light block">
                                42
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mt-2 block">
                                Topik Dibahas di KSM
                            </span>
                        </div>

                        <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal text-center">
                            <span className="text-4xl sm:text-5xl font-black text-hima-blue-light block">
                                23
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mt-2 block">
                                Jadi Program & Aksi
                            </span>
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
