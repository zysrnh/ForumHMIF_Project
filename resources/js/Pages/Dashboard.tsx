import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    APP_CATEGORIES,
    AspirationItem,
    addCommentSharedAspiration,
    addSharedAspiration,
    getSharedAspirations,
    subscribeAspirations,
    toggleVoteSharedAspiration,
} from '@/data/aspirations';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');

    // Navigasi Tampilan (feed / ksm / create / my)
    const [activeNav, setActiveNav] = useState<'feed' | 'ksm' | 'create' | 'my'>('feed');

    // Data State Aspirasi Tersinkronisasi
    const [aspirations, setAspirations] = useState<AspirationItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [sortBy, setSortBy] = useState<'trending' | 'terbaru'>('trending');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State Accordion Tanggapan
    const [openCommentId, setOpenCommentId] = useState<number | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [aspirationId: number]: string }>({});

    // State Form Aspirasi Baru
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState<string>('Akademik & Praktikum');
    const [formContent, setFormContent] = useState('');
    const [formIsAnonymous, setFormIsAnonymous] = useState(false);
    const [formIsKsmAgenda, setFormIsKsmAgenda] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Load & Subscribe Sinkronisasi Data Dua Arah
    useEffect(() => {
        setAspirations(getSharedAspirations());
        const unsubscribe = subscribeAspirations((updated) => {
            setAspirations(updated);
        });
        return unsubscribe;
    }, []);

    // Toggle Upvote Tersinkron
    const handleToggleVote = (id: number) => {
        const updated = toggleVoteSharedAspiration(id);
        setAspirations(updated);
    };

    // Toggle Buka/Tutup Komentar Tanggapan
    const toggleComments = (aspirationId: number) => {
        setOpenCommentId(openCommentId === aspirationId ? null : aspirationId);
    };

    // Kirim Tanggapan Baru Tersinkron
    const handleAddComment = (aspirationId: number, e: React.FormEvent) => {
        e.preventDefault();
        const text = (commentInputs[aspirationId] || '').trim();
        if (!text) return;

        const updated = addCommentSharedAspiration(aspirationId, {
            authorName: user.name,
            authorNim: userNim,
            content: text,
        });

        setAspirations(updated);
        setCommentInputs((prev) => ({
            ...prev,
            [aspirationId]: '',
        }));
    };

    // Submit Aspirasi Baru Tersinkron
    const handleSubmitAspiration = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formContent.trim()) return;

        addSharedAspiration({
            title: formTitle.trim(),
            category: formCategory,
            content: formContent.trim(),
            authorName: formIsAnonymous ? 'Mahasiswa IF' : user.name,
            authorNim: formIsAnonymous ? `${userNim.slice(0, 5)}***` : userNim,
            isAnonymous: formIsAnonymous,
            status: formIsKsmAgenda ? 'ksm' : 'baru',
            isKsmAgenda: formIsKsmAgenda,
        });

        setFormTitle('');
        setFormContent('');
        setFormIsAnonymous(false);
        setFormIsKsmAgenda(false);
        setShowSuccessAlert(true);
        setActiveNav(formIsKsmAgenda ? 'ksm' : 'feed');

        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 5000);
    };

    // Filter & Sort Data
    const filteredAspirations = useMemo(() => {
        return aspirations
            .filter((item) => {
                // Tab KSM: Hanya tampilkan topik KSM
                if (activeNav === 'ksm') {
                    if (item.status !== 'ksm' && !item.isKsmAgenda) {
                        return false;
                    }
                }

                // Tab Aspirasi Saya
                if (activeNav === 'my') {
                    if (item.authorNim !== userNim && !item.isAnonymous) {
                        return false;
                    }
                }

                // Filter Kategori
                if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
                    return false;
                }

                // Search Query
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    const matchTitle = item.title.toLowerCase().includes(query);
                    const matchContent = item.content.toLowerCase().includes(query);
                    if (!matchTitle && !matchContent) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'trending') {
                    return b.votes - a.votes;
                }
                return b.id - a.id;
            });
    }, [aspirations, activeNav, selectedCategory, searchQuery, sortBy, userNim]);

    const getStatusBadge = (item: AspirationItem) => {
        if (item.status === 'ksm' || item.isKsmAgenda) {
            return (
                <div className="flex items-center gap-1">
                    <span className="bg-red-50 border border-hima-red-dark text-hima-red-dark px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                        SIAP KSM
                    </span>
                    {item.ksmDocketNumber && (
                        <span className="bg-hima-red-dark text-white px-1.5 py-0.5 text-[9px] font-mono font-black uppercase">
                            {item.ksmDocketNumber}
                        </span>
                    )}
                </div>
            );
        }

        switch (item.status) {
            case 'kurasi':
                return (
                    <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                        Kurasi
                    </span>
                );
            case 'tindak_lanjut':
                return (
                    <span className="bg-sky-50 border border-hima-blue-light text-hima-blue-light px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                        PROKER
                    </span>
                );
            case 'baru':
            default:
                return (
                    <span className="bg-gray-100 border border-gray-400 text-gray-700 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                        Baru
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            activeNav={activeNav}
            onSelectNav={(nav) => setActiveNav(nav as 'feed' | 'ksm' | 'create' | 'my')}
            header={
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                                {activeNav === 'create'
                                    ? 'Tulis Aspirasi'
                                    : activeNav === 'ksm'
                                    ? 'Agenda Sidang KSM'
                                    : activeNav === 'my'
                                    ? 'Aspirasi Saya'
                                    : 'Forum Aspirasi Mahasiswa'}
                            </h1>
                            {activeNav === 'ksm' && (
                                <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-1.5 py-0.2">
                                    PLENO
                                </span>
                            )}
                        </div>
                        <p className="hidden sm:block text-xs text-gray-600 font-medium mt-0.5">
                            {activeNav === 'create'
                                ? 'Tuliskan aspirasi atau rekomendasikan langsung topik untuk dibawa ke sidang KSM.'
                                : activeNav === 'ksm'
                                ? 'Daftar topik teratas yang lolos kurasi Ristek dan siap disidangkan bersama pimpinan prodi.'
                                : 'Suarakan masukan dan dukung aspirasi rekan mahasiswa untuk kemajuan himpunan & prodi.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeNav !== 'create' ? (
                            <button
                                type="button"
                                onClick={() => setActiveNav('create')}
                                className="hidden sm:inline-flex btn-brutal items-center gap-1.5 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Tulis Aspirasi Baru</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setActiveNav('feed')}
                                className="inline-flex items-center gap-1.5 border border-gray-400 bg-white text-gray-700 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                ← Kembali
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Portal Aspirasi & Sidang KSM" />

            {/* FULL WIDTH CONTAINER DENGAN SPACING BERSIH & TIDAK PADAT */}
            <div className="w-full space-y-3">
                {/* Notifikasi Sukses Sederhana */}
                {showSuccessAlert && (
                    <div className="w-full bg-green-50 border-2 border-green-700 p-2.5 sm:p-3 shadow-sm flex items-center justify-between gap-3 text-xs text-green-900 font-semibold anim-feed-item">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-green-700 text-white font-black flex items-center justify-center text-[10px]">
                                ✓
                            </span>
                            <span>Aspirasi Anda berhasil dikirim dan tersinkronisasi!</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowSuccessAlert(false)}
                            className="text-green-800 font-bold hover:text-black"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* BANNER KHUSUS TAB KSM */}
                {activeNav === 'ksm' && (
                    <div className="w-full bg-red-50 border-2 border-hima-red-dark p-3 sm:p-4 shadow-sm sm:shadow-brutal-red anim-feed-item flex items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-1.5 py-0.2">
                                    KSM HMIF
                                </span>
                                <span className="text-[11px] sm:text-xs font-black uppercase text-hima-red-dark">
                                    Sidang Pleno Mahasiswa
                                </span>
                            </div>
                            <h2 className="text-xs sm:text-base font-black text-gray-950 mt-0.5">
                                Berkas Aspirasi Resmi Sidang KSM
                            </h2>
                            <p className="hidden sm:block text-xs text-gray-700 font-medium mt-0.5">
                                Topik di bawah ini memiliki dukungan suara tertinggi dan sedang diajukan untuk menghasilkan Surat Keputusan / Proker Bersama Kaprodi.
                            </p>
                        </div>
                        <div className="shrink-0 bg-white border-2 border-hima-red-dark px-2.5 py-1 sm:p-2 text-center shadow-sm">
                            <span className="text-base sm:text-xl font-black text-hima-red-dark font-mono block leading-none">
                                {aspirations.filter((a) => a.status === 'ksm' || a.isKsmAgenda).length}
                            </span>
                            <span className="text-[9px] font-black uppercase text-gray-600 block mt-0.5">
                                Berkas
                            </span>
                        </div>
                    </div>
                )}

                {/* 1. TAMPILAN FOKUS: FORM INPUT ASPIRASI */}
                {activeNav === 'create' ? (
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-7 shadow-sm sm:shadow-brutal-sm anim-feed-item">
                        <div className="border-b border-gray-200 pb-2.5 mb-4">
                            <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase">
                                Tulis Masukan & Aspirasi
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Masukkan detail aspirasi dengan jelas agar mudah dikaji tim HIMA IF dan diajukan ke KSM.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAspiration} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                    Judul Aspirasi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Contoh: Pengadaan Server GPU Lab Komputer untuk Matkul AI"
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2 sm:p-2.5 text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                        Kategori Topik *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full border-2 border-hima-blue-dark bg-white p-2 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none rounded-none shadow-sm"
                                    >
                                        {APP_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                        Identitas Pengirim
                                    </label>
                                    <div className="border-2 border-hima-blue-dark p-2 bg-slate-50 flex items-center justify-between shadow-sm">
                                        <span className="text-xs font-bold text-gray-800 truncate mr-2">
                                            {formIsAnonymous ? 'Anonim (Privasi Terjaga)' : `${user.name}`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                                            className={`border px-2 py-0.5 text-[10px] font-black uppercase transition-colors shrink-0 ${
                                                formIsAnonymous
                                                    ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                                    : 'bg-white text-hima-blue-dark border-hima-blue-dark'
                                            }`}
                                        >
                                            {formIsAnonymous ? 'Mode: Anonim' : 'Mode: Publik'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* OPSI USULAN KSM */}
                            <div className="border border-hima-red-light bg-red-50/70 p-2.5 sm:p-3">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsKsmAgenda}
                                        onChange={(e) => setFormIsKsmAgenda(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded-none border-2 border-hima-red-dark text-hima-red-dark focus:ring-0 cursor-pointer shrink-0"
                                    />
                                    <div>
                                        <span className="text-xs font-black uppercase text-hima-red-dark block leading-snug">
                                            Rekomendasikan Langsung ke Agenda Sidang Pleno KSM HMIF
                                        </span>
                                        <span className="text-[11px] text-gray-600 block mt-0.5">
                                            Centang jika aspirasi ini mendesak dan menyangkut kebijakan umum agar diprioritaskan masuk berkas KSM.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Isi Uraian */}
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                    Uraian Masalah & Usulan Solusi *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Jelaskan kendala yang dialami serta rekomendasi solusi yang diharapkan..."
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-sm resize-none"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('feed')}
                                    className="border border-gray-400 bg-white px-3.5 py-1.5 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-5 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm hover:bg-hima-blue-light"
                                >
                                    Kirim Aspirasi
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* 2. TAMPILAN FEED ASPIRASI */
                    <div className="w-full space-y-2.5">
                        {/* Filter & Pencarian Ramping */}
                        <div className="w-full bg-white border-2 border-hima-blue-dark p-2.5 sm:p-3 shadow-sm sm:shadow-brutal-sm space-y-2 anim-feed-item">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={
                                            activeNav === 'ksm'
                                                ? 'Cari berkas KSM...'
                                                : 'Cari aspirasi mahasiswa...'
                                        }
                                        className="w-full px-2.5 py-1.5 border border-hima-blue-dark sm:border-2 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none rounded-none shadow-xs"
                                    />
                                </div>

                                {/* Urutan Tombol Tanpa Emoji */}
                                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('trending')}
                                        className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                                            sortBy === 'trending'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                : 'bg-white text-gray-700 border-gray-300'
                                        }`}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                        </svg>
                                        <span>Top Vote</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('terbaru')}
                                        className={`border px-2 py-0.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                                            sortBy === 'terbaru'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                : 'bg-white text-gray-700 border-gray-300'
                                        }`}
                                    >
                                        Terbaru
                                    </button>
                                </div>
                            </div>

                            {/* Kategori Chips Halus */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
                                {APP_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-hima-red-dark text-white border-hima-red-dark shadow-xs'
                                                : 'bg-slate-50 text-gray-600 border-gray-300 hover:bg-white hover:text-black'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Aspirasi Cards */}
                        {filteredAspirations.length === 0 ? (
                            <div className="w-full bg-white border-2 border-hima-blue-dark p-6 text-center shadow-sm anim-feed-item">
                                <p className="text-xs sm:text-sm font-black uppercase text-hima-blue-dark">
                                    {activeNav === 'ksm'
                                        ? 'Belum Ada Berkas Agenda KSM'
                                        : 'Belum Ada Aspirasi'}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {searchQuery
                                        ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian.'
                                        : 'Mulai sampaikan aspirasi pertama Anda.'}
                                </p>
                            </div>
                        ) : (
                            filteredAspirations.map((item, index) => {
                                const isCommentsOpen = openCommentId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        style={{ animationDelay: `${index * 40}ms` }}
                                        className="w-full bg-white border-2 border-hima-blue-dark p-3.5 sm:p-4 shadow-sm sm:shadow-brutal-sm transition-all duration-150 anim-feed-item space-y-2 hover:border-hima-blue-light"
                                    >
                                        {/* Baris Status & Kategori Tag */}
                                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {getStatusBadge(item)}
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <span className="text-[10px] font-medium text-gray-400">
                                                {item.createdAt}
                                            </span>
                                        </div>

                                        {/* Jadwal Sidang KSM (Bila ada) Tanpa Emoji */}
                                        {item.ksmPlenoSchedule && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-hima-red-dark bg-red-50/70 border border-red-200 px-2 py-0.5">
                                                <svg className="w-3 h-3 text-hima-red-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{item.ksmPlenoSchedule}</span>
                                            </div>
                                        )}

                                        {/* Judul Aspirasi */}
                                        <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight leading-snug">
                                            {item.title}
                                        </h3>

                                        {/* Uraian Aspirasi */}
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                            {item.content}
                                        </p>

                                        {/* Footer Kartu */}
                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                                            {/* Info Penulis Ringkas */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate max-w-[50%]">
                                                <div className="w-5 h-5 bg-hima-blue-dark text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                                    {item.authorName.charAt(0)}
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-800 truncate">
                                                    {item.authorName}
                                                </span>
                                            </div>

                                            {/* Aksi Vote & Tanggapan Tanpa Emoji */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* Tombol Tanggapan */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleComments(item.id)}
                                                    className={`inline-flex items-center gap-1 text-[11px] font-bold py-1 px-2 border transition-all active:scale-95 ${
                                                        isCommentsOpen
                                                            ? 'bg-blue-50 text-hima-blue-dark border-hima-blue-dark'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>{item.comments.length}</span>
                                                    <span className="hidden sm:inline">Pesan</span>
                                                </button>

                                                {/* Tombol Vote */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleVote(item.id)}
                                                    aria-label={`Dukung aspirasi: ${item.title}`}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border-2 transition-all active:scale-95 ${
                                                        item.hasVoted
                                                            ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs anim-vote-pop'
                                                            : 'bg-white text-hima-blue-dark border-hima-blue-dark hover:bg-blue-50 shadow-xs'
                                                    }`}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    <span>{item.votes}</span>
                                                    <span className="text-[9px]">
                                                        {item.hasVoted ? 'Didukung' : 'Vote'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* SECTION ACCORDION TANGGAPAN */}
                                        {isCommentsOpen && (
                                            <div className="pt-2.5 border-t border-dashed border-gray-300 bg-slate-50/70 p-2.5 sm:p-3 space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-wider text-hima-blue-dark">
                                                    Diskusi Mahasiswa ({item.comments.length})
                                                </div>

                                                {/* List Tanggapan */}
                                                <div className="space-y-1.5">
                                                    {item.comments.length === 0 ? (
                                                        <p className="text-[11px] text-gray-500 italic py-1">
                                                            Belum ada tanggapan. Jadilah yang pertama memberikan masukan!
                                                        </p>
                                                    ) : (
                                                        item.comments.map((comment) => (
                                                            <div
                                                                key={comment.id}
                                                                className={`p-2 border text-[11px] leading-relaxed ${
                                                                    comment.isOfficial
                                                                        ? 'bg-blue-50/80 border-hima-blue-dark shadow-xs'
                                                                        : 'bg-white border-gray-200'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-black text-gray-950">
                                                                            {comment.authorName}
                                                                        </span>
                                                                        {comment.isOfficial && (
                                                                            <span className="text-[8px] font-black uppercase bg-hima-blue-dark text-white px-1">
                                                                                PENGURUS
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[9px] text-gray-400">
                                                                        {comment.createdAt}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-700">
                                                                    {comment.content}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Form Kirim Tanggapan */}
                                                <form
                                                    onSubmit={(e) => handleAddComment(item.id, e)}
                                                    className="flex gap-1.5 pt-1"
                                                >
                                                    <input
                                                        type="text"
                                                        value={commentInputs[item.id] || ''}
                                                        onChange={(e) =>
                                                            setCommentInputs({
                                                                ...commentInputs,
                                                                [item.id]: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Tulis tanggapan..."
                                                        className="flex-1 px-2.5 py-1 text-xs border border-hima-blue-dark bg-white focus:outline-none rounded-none shadow-xs"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="border border-hima-blue-dark bg-hima-blue-dark text-white px-3 py-1 text-xs font-bold uppercase hover:bg-hima-blue-light transition-colors shrink-0"
                                                    >
                                                        Kirim
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
