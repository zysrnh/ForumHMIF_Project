import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useBiDirectionalScrollReveal } from '@/hooks/useBiDirectionalScrollReveal';
import {
    APP_CATEGORIES,
    AspirationItem,
    addCommentSharedAspiration,
    deleteSharedAspiration,
    deleteSharedComment,
    fetchAspirationsFromServer,
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

    // Pasang animasi kinetik scroll reveal masuk-keluar dua arah
    useBiDirectionalScrollReveal();

    useEffect(() => {
        setAspirations(getSharedAspirations());
        fetchAspirationsFromServer().then((items) => {
            setAspirations(items);
        });
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
                    item.authorName.toLowerCase().includes(query),
            );
        }

        // Category filter
        if (activeFilter === 'Lagi Rame') {
            result = result.filter((item) => item.votes >= 40);
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

    const handleVote = async (id: number) => {
        const updated = await toggleVoteSharedAspiration(id);
        setAspirations(updated);
    };

    const handleDeleteAspiration = async (id: number, title: string) => {
        if (!confirm(`Hapus aspirasi "${title}"?`)) return;
        await deleteSharedAspiration(id);
        setAspirations(getSharedAspirations());
    };

    const handleDeleteComment = async (commentId: number, aspirationId: number) => {
        if (!confirm('Hapus komentar ini?')) return;
        await deleteSharedComment(commentId, aspirationId);
        setAspirations(getSharedAspirations());
    };

    const toggleExpandComment = (id: number) => {
        setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSendComment = async (e: React.FormEvent, aspirationId: number) => {
        e.preventDefault();
        const text = commentTexts[aspirationId]?.trim();
        if (!text) return;

        const updated = await addCommentSharedAspiration(aspirationId, {
            content: text,
        });
        setAspirations(updated);

        setCommentTexts((prev) => ({ ...prev, [aspirationId]: '' }));
    };

    return (
        <>
            <Head title="Eksplorasi Topik Aspirasi - Forum HMIF" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-start p-2.5 sm:p-6 lg:p-8 pb-20 md:pb-8 relative overflow-x-hidden selection:bg-hima-red-light selection:text-white">
                <div className="w-full max-w-7xl z-10 space-y-10 sm:space-y-14 my-2 sm:my-4">
                    {/* 1. NAVBAR FORUM (SERAGAM DENGAN BERANDA) */}
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

                        {/* Menu Nav Desktop Seragam */}
                        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-bold uppercase tracking-wider text-hima-blue-dark">
                            <Link href="/" className="hover:text-hima-blue-light transition-colors">
                                Beranda
                            </Link>
                            <Link href="/#aspirasi" className="hover:text-hima-blue-light transition-colors">
                                Aspirasi
                            </Link>
                            <Link
                                href={route('topik.index')}
                                className="text-hima-red-light border-b-2 border-hima-red-light pb-0.5"
                            >
                                Topik
                            </Link>
                            <Link
                                href={route('ksm.survey.index')}
                                className="hover:text-hima-blue-light transition-colors"
                            >
                                Survei KSM
                            </Link>
                            <Link href="/#cara-kerja" className="hover:text-hima-blue-light transition-colors">
                                Cara Kerja
                            </Link>
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

                    {/* 2. HEADER BANNER */}
                    <section className="scroll-reveal bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-sm space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b-2 border-slate-100 pb-5">
                            <div className="space-y-1.5 max-w-2xl">
                                <h1 className="text-xl sm:text-3xl font-black text-hima-blue-dark uppercase tracking-tight leading-tight">
                                    Eksplorasi Aspirasi Mahasiswa
                                </h1>
                                <p className="text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
                                    Eksplorasi masukan, ide fasilitas, dan kebutuhan perkuliahan mahasiswa IF. Berikan vote untuk aspirasi yang kamu dukung!
                                </p>
                            </div>

                            {/* Summary Metrics Sederhana */}
                            <div className="w-full md:w-auto grid grid-cols-2 md:flex border-2 border-hima-blue-dark bg-blue-50/50 divide-x-2 divide-hima-blue-dark shadow-brutal-xs shrink-0">
                                <div className="p-2.5 sm:p-3 text-center sm:min-w-[110px]">
                                    <span className="text-xl sm:text-2xl font-black text-hima-blue-dark block font-mono">
                                        {stats.total}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider mt-0.5 block">
                                        Total Aspirasi
                                    </span>
                                </div>
                                <div className="p-2.5 sm:p-3 text-center sm:min-w-[110px]">
                                    <span className="text-xl sm:text-2xl font-black text-hima-red-light block font-mono">
                                        {aspirations.reduce((sum, item) => sum + item.votes, 0)}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider mt-0.5 block">
                                        Total Vote
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
                                    placeholder="Cari aspirasi mahasiswa..."
                                    className="w-full border-2 border-hima-blue-dark p-2.5 sm:p-3 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-brutal-xs"
                                />
                            </div>

                            {/* Dropdown Kategori & Sort Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative w-full sm:w-56">
                                    <select
                                        id="topic-category-select"
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value)}
                                        className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs font-bold text-black focus:outline-none focus:border-hima-blue-light rounded-none shadow-brutal-xs cursor-pointer appearance-none pr-8"
                                    >
                                        <option value="Semua">Semua Kategori ({stats.total})</option>
                                        <option value="Lagi Rame">Top Vote Terbanyak</option>
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

                                <div className="flex items-center gap-1 border-2 border-hima-blue-dark bg-white p-1 shadow-brutal-xs shrink-0 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('votes')}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                                            sortBy === 'votes'
                                                ? 'bg-hima-blue-dark text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                        </svg>
                                        <span>Top Vote</span>
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
                        </div>
                    </section>

                    {/* 3. LIST TOPIK */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-600 px-1">
                            <span>Menampilkan {filteredItems.length} aspirasi</span>
                            <span className="text-hima-blue-dark font-black">
                                Status: Realtime
                            </span>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="bg-white border-2 border-hima-blue-dark p-12 text-center shadow-[6px_6px_0px_0px_#1A467C] space-y-3">
                                <p className="text-base font-black text-hima-blue-dark uppercase">
                                    Tidak ada aspirasi yang sesuai pencarian
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
                            <div className="space-y-6 sm:space-y-7">
                                {filteredItems.map((item, index) => {
                                    const isTop = index === 0 && sortBy === 'votes';
                                    const isExpanded = expandedComments[item.id] || false;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`scroll-reveal stagger-${(index % 4) + 1} bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-[5px_5px_0px_0px_#1A467C] card-brutal-hover space-y-2.5`}
                                        >
                                            {/* Header Card: Category & Waktu */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5 shadow-xs">
                                                        {item.category}
                                                    </span>

                                                    {isTop && (
                                                        <span className="text-[10px] font-black uppercase tracking-wide bg-hima-red-light text-white px-2 py-0.5 shadow-xs">
                                                            TOP VOTE #1
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-gray-400">
                                                        {item.createdAt}
                                                    </span>
                                                    {item.canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAspiration(item.id, item.title)}
                                                            className="border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-2 py-0.5 text-[10px] font-bold uppercase transition-colors"
                                                            title="Hapus Aspirasi"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Judul & Isi Aspirasi */}
                                            <div className="space-y-1.5">
                                                <h2 className="text-base sm:text-lg font-black text-hima-blue-dark leading-snug">
                                                    {item.title}
                                                </h2>
                                                <p className="text-xs sm:text-[13px] font-medium text-gray-700 leading-relaxed whitespace-pre-line">
                                                    {item.content}
                                                </p>
                                            </div>

                                            {/* Footer Card: Author, Tanggapan Toggle, Vote Button */}
                                            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 truncate max-w-[50%]">
                                                    <div className="w-6 h-6 border border-hima-blue-dark bg-hima-blue-dark text-white flex items-center justify-center font-black text-[10px] shadow-xs shrink-0">
                                                        {getInitials(item.authorName)}
                                                    </div>
                                                    <div className="min-w-0 truncate">
                                                        <span className="text-xs font-bold text-gray-900 block truncate">
                                                            {item.isAnonymous ? 'Mahasiswa Anonim' : item.authorName}
                                                        </span>
                                                        {item.authorClass && (
                                                            <span className="text-[9px] font-bold text-gray-500 font-mono block -mt-0.5 truncate">
                                                                {item.authorClass}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandComment(item.id)}
                                                        className="btn-brutal px-2.5 py-1 text-xs font-bold border border-hima-blue-dark bg-slate-50 text-gray-800 hover:bg-slate-100 shadow-xs flex items-center gap-1.5"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        <span>{item.comments ? item.comments.length : 0} Pesan</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleVote(item.id)}
                                                        className={`btn-brutal inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black border-2 border-hima-blue-dark transition-all ${
                                                            item.hasVoted
                                                                ? 'bg-hima-red-light text-white shadow-xs'
                                                                : 'bg-white text-hima-blue-dark hover:bg-gray-100 shadow-xs'
                                                        }`}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        <span>{item.votes}</span>
                                                        <span className="text-[10px] uppercase font-bold">
                                                            {item.hasVoted ? 'Didukung' : 'Vote'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Comments Section */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-dashed border-gray-300 space-y-2.5 bg-slate-50/70 p-3">
                                                    <div className="text-[11px] font-black uppercase text-hima-blue-dark tracking-wider">
                                                        Tanggapan & Diskusi Mahasiswa ({item.comments?.length || 0})
                                                    </div>

                                                    {item.comments && item.comments.length > 0 ? (
                                                        <div className="space-y-2.5">
                                                            {item.comments.map((c) => (
                                                                <div
                                                                    key={c.id}
                                                                    className={`p-3 border text-xs leading-relaxed ${
                                                                        c.isOfficial
                                                                            ? 'border-hima-blue-dark bg-blue-50/90 shadow-xs'
                                                                            : 'border-slate-200 bg-white shadow-xs'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start gap-2.5">
                                                                        {/* Foto Profil / Avatar Inisial */}
                                                                        <div
                                                                            className={`w-7 h-7 shrink-0 flex items-center justify-center font-black text-[10px] border shadow-xs ${
                                                                                c.isOfficial
                                                                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                                                    : 'bg-slate-800 text-white border-slate-900'
                                                                            }`}
                                                                        >
                                                                            {getInitials(c.authorName)}
                                                                        </div>

                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                                    <span className="font-black text-slate-900 text-xs">
                                                                                        {c.authorName}
                                                                                    </span>
                                                                                    {c.isOfficial && (
                                                                                        <span className="text-[8px] font-black uppercase bg-hima-blue-dark text-white px-1.5 py-0.5 tracking-wider">
                                                                                            {c.authorRole || 'PENGURUS HIMA'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                                                        {c.createdAt}
                                                                                    </span>
                                                                                    {c.canDelete && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleDeleteComment(c.id, item.id)}
                                                                                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase ml-1"
                                                                                            title="Hapus Komentar"
                                                                                        >
                                                                                            ✕
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-slate-700 text-xs leading-relaxed">
                                                                                {c.content}
                                                                            </p>
                                                                        </div>
                                                                    </div>
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
                                                        className="flex gap-2 pt-1"
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
                                                            placeholder="Tulis tanggapan atau saran kamu..."
                                                            className="flex-1 border-2 border-hima-blue-dark px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-hima-blue-light rounded-none shadow-xs bg-white"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="btn-brutal bg-hima-blue-dark text-white font-bold px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-hima-blue-light shrink-0"
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
                    <footer className="border-t-2 border-hima-blue-dark pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-gray-600">
                        <div>
                            <p className="font-bold text-hima-blue-dark text-sm sm:text-base">
                                Dibuat anak IF, buat anak IF.
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Forum Aspirasi HMIF &bull; Himpunan Mahasiswa Teknik Informatika
                            </p>
                        </div>

                        <div className="text-xs font-bold text-hima-blue-dark uppercase tracking-wider">
                            &copy; 2026 HIMA INFORMATIKA &bull; IDE LPKIA
                        </div>
                    </footer>
                </div>

                {/* ========================================================================= */}
                {/* 5. MOBILE APP BOTTOM NAVIGATION TOOLBAR                                   */}
                {/* ========================================================================= */}
                <nav
                    aria-label="Mobile app navigation toolbar"
                    className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-hima-blue-dark shadow-[0px_-4px_12px_rgba(26,70,124,0.15)] px-1 py-1"
                >
                    <div className="flex items-center justify-around gap-1 relative">
                        {/* 1. Beranda */}
                        <Link
                            href="/"
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-blue-dark font-bold">
                                Beranda
                            </span>
                        </Link>

                        {/* 2. Aspirasi */}
                        <Link
                            href="/#aspirasi"
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
                        </Link>

                        {/* 3. Topik Rame (ACTIVE) */}
                        <Link
                            href={route('topik.index')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 bg-blue-50/50"
                        >
                            <div className="p-1 border border-hima-blue-dark bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-hima-blue-dark font-black">
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
