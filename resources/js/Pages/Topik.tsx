import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    AspirationItem,
    addCommentSharedAspiration,
    getAspirationStats,
    getSharedAspirations,
    subscribeAspirations,
    toggleVoteSharedAspiration,
} from '@/data/aspirations';

function getInitials(name: string): string {
    if (!name) return 'IF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Topik({
    auth,
}: PageProps<{ canLogin?: boolean; canRegister?: boolean }>) {
    const [aspirations, setAspirations] = useState<AspirationItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [sortBy, setSortBy] = useState<'votes' | 'latest'>('votes');
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});

    useEffect(() => {
        setAspirations(getSharedAspirations());
        const unsubscribe = subscribeAspirations((updated) => {
            setAspirations(updated);
        });
        return unsubscribe;
    }, []);

    const stats = getAspirationStats(aspirations);

    const filteredItems = useMemo(() => {
        let result = [...aspirations];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.content.toLowerCase().includes(query) ||
                    item.authorName.toLowerCase().includes(query) ||
                    (item.ksmDocketNumber && item.ksmDocketNumber.toLowerCase().includes(query)),
            );
        }

        // Category / Status filter
        if (activeFilter === 'Lagi Rame') {
            result = result.filter((item) => item.votes >= 40);
        } else if (activeFilter === 'Agenda KSM') {
            result = result.filter((item) => item.isKsmAgenda || item.status === 'ksm');
        } else if (activeFilter === 'Proker') {
            result = result.filter((item) => item.status === 'tindak_lanjut');
        } else if (activeFilter !== 'Semua') {
            result = result.filter((item) => item.category === activeFilter);
        }

        // Sorting
        if (sortBy === 'votes') {
            result.sort((a, b) => b.votes - a.votes);
        } else {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [aspirations, searchQuery, activeFilter, sortBy]);

    const handleVote = (id: number) => {
        toggleVoteSharedAspiration(id);
    };

    const toggleExpandComment = (id: number) => {
        setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSendComment = (e: React.FormEvent, aspirationId: number) => {
        e.preventDefault();
        const text = commentTexts[aspirationId]?.trim();
        if (!text) return;

        const currentAuthor = auth.user ? auth.user.name : 'Mahasiswa IF';
        const currentNim =
            auth.user && 'nim' in auth.user
                ? (auth.user as { nim?: string }).nim || '240414***'
                : '240414***';

        addCommentSharedAspiration(aspirationId, {
            authorName: currentAuthor,
            authorNim: currentNim,
            content: text,
        });

        setCommentTexts((prev) => ({ ...prev, [aspirationId]: '' }));
    };

    return (
        <>
            <Head title="Topik Lagi Rame & Agenda KSM - Forum HMIF" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 relative selection:bg-hima-red-light selection:text-white">
                <div className="w-full max-w-7xl z-10 space-y-8 my-2">
                    {/* 1. NAVBAR */}
                    <header className="anim-brutal-drop bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-[6px_6px_0px_0px_#1A467C] flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm group-hover:rotate-[-4deg] transition-transform duration-200">
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
                                    Topik Lagi Rame &bull; Sidang KSM
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-hima-blue-dark">
                            <Link href="/" className="hover:text-hima-blue-light transition-colors">
                                Beranda
                            </Link>
                            <Link
                                href={route('topik.index')}
                                className="text-hima-red-light border-b-2 border-hima-red-light pb-0.5"
                            >
                                Topik Rame
                            </Link>
                        </nav>

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

                    {/* 2. HEADER BANNER */}
                    <section className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1A467C] space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-hima-blue-dark pb-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-block bg-hima-red-light text-white text-[10px] font-black uppercase px-2.5 py-1 tracking-wider border border-hima-blue-dark shadow-brutal-sm">
                                    Radar Aspirasi Terbuka
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black text-hima-blue-dark uppercase tracking-tight leading-tight">
                                    Topik Lagi Rame & Agenda KSM
                                </h1>
                                <p className="text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
                                    Eksplorasi seluruh unek-unek, ide proker, dan usulan fasilitas mahasiswa IF. Dukung dengan upvote agar lolos ke meja Sidang Pleno KSM!
                                </p>
                            </div>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-3 border-2 border-hima-blue-dark bg-blue-50/50 divide-x-2 divide-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] shrink-0">
                                <div className="p-3 text-center min-w-[85px] sm:min-w-[100px]">
                                    <span className="text-xl sm:text-2xl font-black text-hima-blue-dark block font-mono">
                                        {stats.total}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider mt-0.5 block">
                                        Total Masuk
                                    </span>
                                </div>
                                <div className="p-3 text-center min-w-[85px] sm:min-w-[100px]">
                                    <span className="text-xl sm:text-2xl font-black text-hima-red-light block font-mono">
                                        {stats.ksmCount}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider mt-0.5 block">
                                        Topik KSM
                                    </span>
                                </div>
                                <div className="p-3 text-center min-w-[85px] sm:min-w-[100px]">
                                    <span className="text-xl sm:text-2xl font-black text-hima-blue-light block font-mono">
                                        {stats.actionCount}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider mt-0.5 block">
                                        Proker
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search & Sort Row */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari aspirasi, nomor berkas #KSM, atau pengusul..."
                                    className="w-full border-2 border-hima-blue-dark p-2.5 sm:p-3 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-brutal-sm"
                                />
                            </div>

                            <div className="flex items-center gap-1 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-sm shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSortBy('votes')}
                                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                                        sortBy === 'votes'
                                            ? 'bg-hima-blue-dark text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    🔥 Terbanyak Vote
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortBy('latest')}
                                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                                        sortBy === 'latest'
                                            ? 'bg-hima-blue-dark text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Terbaru
                                </button>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {[
                                'Semua',
                                'Lagi Rame',
                                'Agenda KSM',
                                'Proker',
                                'Fasilitas & Lab',
                                'Akademik & Kurikulum',
                                'Kemahasiswaan & HIMA',
                                'Kebijakan Kampus',
                            ].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveFilter(tab)}
                                    className={`text-xs font-bold px-3 py-1.5 border-2 border-hima-blue-dark whitespace-nowrap transition-all ${
                                        activeFilter === tab
                                            ? 'bg-hima-red-light text-white shadow-[3px_3px_0px_0px_#1A467C] -translate-y-0.5'
                                            : 'bg-white text-hima-blue-dark hover:bg-blue-50 shadow-brutal-sm'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 3. LIST TOPIK */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-600 px-1">
                            <span>Menampilkan {filteredItems.length} topik aspirasi</span>
                            <span className="text-hima-blue-dark font-black">
                                Status: Realtime Two-Way Sync
                            </span>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="bg-white border-2 border-hima-blue-dark p-12 text-center shadow-[6px_6px_0px_0px_#1A467C] space-y-3">
                                <p className="text-base font-black text-hima-blue-dark uppercase">
                                    Tidak ada topik yang cocok dengan pencarian
                                </p>
                                <p className="text-xs text-gray-500">
                                    Coba ubah kata kunci atau ganti filter kategori.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveFilter('Semua');
                                    }}
                                    className="btn-brutal px-4 py-2 bg-hima-blue-dark text-white text-xs font-bold uppercase tracking-wider"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredItems.map((item, index) => {
                                    const isKsm = item.status === 'ksm' || item.isKsmAgenda;
                                    const isTop = index === 0 && sortBy === 'votes';
                                    const isExpanded = expandedComments[item.id] || false;

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-[6px_6px_0px_0px_#1A467C] card-brutal-hover space-y-4"
                                        >
                                            {/* Header Card: Category, KSM Docket, Status */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[11px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2.5 py-0.5 shadow-brutal-sm">
                                                        {item.category}
                                                    </span>

                                                    {isTop && (
                                                        <span className="text-[10px] font-black uppercase tracking-wide bg-hima-red-light text-white px-2 py-0.5 shadow-brutal-sm">
                                                            TOP #1
                                                        </span>
                                                    )}

                                                    {isKsm && item.ksmDocketNumber && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider bg-hima-red-dark text-white px-2 py-0.5 border border-hima-red-dark">
                                                            {item.ksmDocketNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    {isKsm ? (
                                                        <span className="text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 bg-red-50 text-hima-red-light border-hima-red-light">
                                                            AGENDA KSM
                                                        </span>
                                                    ) : item.status === 'tindak_lanjut' ? (
                                                        <span className="text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 bg-sky-50 text-hima-blue-light border-hima-blue-light">
                                                            PROKER
                                                        </span>
                                                    ) : item.status === 'kurasi' ? (
                                                        <span className="text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 bg-blue-50 text-hima-blue-dark border-hima-blue-dark">
                                                            KURASI ADVOKASI
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase tracking-wider border px-2.5 py-0.5 bg-gray-100 text-gray-800 border-gray-400">
                                                            BARU MASUK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Judul & Isi Aspirasi */}
                                            <div className="space-y-2">
                                                <h2 className="text-base sm:text-xl font-black text-hima-blue-dark leading-snug">
                                                    {item.title}
                                                </h2>
                                                <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-line">
                                                    {item.content}
                                                </p>
                                            </div>

                                            {/* KSM Pleno Schedule Note */}
                                            {item.ksmPlenoSchedule && (
                                                <div className="p-2.5 bg-red-50/70 border border-hima-red-light text-xs font-bold text-hima-red-dark flex items-center gap-2">
                                                    <span>🏛️</span>
                                                    <span>Jadwal: {item.ksmPlenoSchedule}</span>
                                                </div>
                                            )}

                                            {/* Footer Card: Author, Tanggapan Toggle, Vote Button */}
                                            <div className="pt-3 border-t-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 border border-hima-blue-dark bg-hima-blue-dark text-white flex items-center justify-center font-black text-xs shadow-brutal-sm">
                                                        {getInitials(item.authorName)}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-gray-900 block leading-tight">
                                                            {item.isAnonymous ? 'Mahasiswa Anonim' : item.authorName}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-gray-400">
                                                            {item.createdAt}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandComment(item.id)}
                                                        className="btn-brutal px-3 py-1.5 text-xs font-bold border-2 border-hima-blue-dark bg-slate-50 text-gray-800 hover:bg-slate-100 shadow-brutal-sm flex items-center gap-1.5"
                                                    >
                                                        <span>💬</span>
                                                        <span>{item.comments ? item.comments.length : 0} Tanggapan</span>
                                                        <span className="text-[9px]">
                                                            {isExpanded ? '▲' : '▼'}
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleVote(item.id)}
                                                        className={`btn-brutal inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black border-2 border-hima-blue-dark transition-all ${
                                                            item.hasVoted
                                                                ? 'bg-hima-red-light text-white shadow-[3px_3px_0px_0px_#1A467C]'
                                                                : 'bg-white text-hima-blue-dark hover:bg-gray-100 shadow-[3px_3px_0px_0px_#1A467C]'
                                                        }`}
                                                    >
                                                        <span>▲</span>
                                                        <span>{item.votes}</span>
                                                        <span className="text-[10px] uppercase font-bold">
                                                            {item.hasVoted ? 'Didukung' : 'Dukung'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Comments Section */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300 space-y-3 bg-slate-50/60 p-3 sm:p-4 border">
                                                    <div className="text-xs font-black uppercase text-hima-blue-dark tracking-wider">
                                                        Tanggapan & Diskusi Mahasiswa ({item.comments?.length || 0})
                                                    </div>

                                                    {item.comments && item.comments.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {item.comments.map((c) => (
                                                                <div
                                                                    key={c.id}
                                                                    className={`p-3 border-2 ${
                                                                        c.isOfficial
                                                                            ? 'border-hima-blue-dark bg-blue-50/70 shadow-brutal-sm'
                                                                            : 'border-gray-200 bg-white'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-black text-gray-900">
                                                                                {c.authorName}
                                                                            </span>
                                                                            {c.isOfficial && (
                                                                                <span className="text-[9px] font-black uppercase bg-hima-blue-dark text-white px-1.5 py-0.2">
                                                                                    {c.authorRole || 'PENGURUS HIMA'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-gray-400">
                                                                            {c.createdAt}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-700 leading-relaxed">
                                                                        {c.content}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-500 italic">
                                                            Belum ada tanggapan untuk topik ini. Jadilah yang pertama berkomentar!
                                                        </p>
                                                    )}

                                                    {/* Quick Comment Input */}
                                                    <form
                                                        onSubmit={(e) => handleSendComment(e, item.id)}
                                                        className="flex gap-2 pt-2"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={commentTexts[item.id] || ''}
                                                            onChange={(e) =>
                                                                setCommentTexts((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Tulis tanggapan atau dukungan kamu..."
                                                            className="flex-1 border-2 border-hima-blue-dark px-3 py-2 text-xs font-semibold focus:outline-none focus:border-hima-blue-light rounded-none shadow-brutal-sm"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="btn-brutal bg-hima-blue-dark text-white font-black px-4 py-2 text-xs uppercase tracking-wider hover:bg-hima-blue-light"
                                                        >
                                                            Kirim
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* 4. FOOTER */}
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
