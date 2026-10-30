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
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');
    const isAdmin = ['admin', 'super_admin', 'superadmin'].includes(user.role || '');

    // Navigasi Tampilan yang Sederhana & Ramah (feed / create / my)
    const [activeNav, setActiveNav] = useState<'feed' | 'create' | 'my'>('feed');

    // Data State Aspirasi Tersinkronisasi
    const [aspirations, setAspirations] = useState<AspirationItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [sortBy, setSortBy] = useState<'trending' | 'terbaru'>('trending');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State Accordion Tanggapan
    const [openCommentId, setOpenCommentId] = useState<number | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [aspirationId: number]: string }>({});

    // State Form Aspirasi Baru yang Bersih & Efisien
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState<string>('Akademik & Praktikum');
    const [formContent, setFormContent] = useState('');
    const [formIsAnonymous, setFormIsAnonymous] = useState(false);
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

    // Submit Aspirasi Baru Cepat & Efisien
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
            status: 'baru',
        });

        setFormTitle('');
        setFormContent('');
        setFormIsAnonymous(false);
        setShowSuccessAlert(true);
        setActiveNav('feed');

        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 5000);
    };

    // Filter & Sort Data Bersih
    const filteredAspirations = useMemo(() => {
        return aspirations
            .filter((item) => {
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

    return (
        <AuthenticatedLayout
            activeNav={activeNav}
            onSelectNav={(nav) => setActiveNav(nav as 'feed' | 'create' | 'my')}
            header={
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-base sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                            {activeNav === 'create'
                                ? 'Tulis Aspirasi'
                                : activeNav === 'my'
                                ? 'Aspirasi Saya'
                                : 'Forum Aspirasi Mahasiswa'}
                        </h1>
                        <p className="hidden sm:block text-xs text-gray-600 font-medium mt-0.5">
                            {activeNav === 'create'
                                ? 'Sampaikan ide, masukan, atau kendala fasilitas kamu secara langsung.'
                                : activeNav === 'my'
                                ? 'Daftar seluruh aspirasi yang pernah kamu sampaikan ke forum.'
                                : 'Suarakan masukan dan dukung aspirasi rekan mahasiswa Teknik Informatika.'}
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
                                <span>Tulis Aspirasi</span>
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
            <Head title="Portal Aspirasi Mahasiswa HIMA IF" />

            <div className="w-full space-y-3">
                {/* Notifikasi Sukses Sederhana */}
                {showSuccessAlert && (
                    <div className="w-full bg-green-50 border-2 border-green-700 p-2.5 sm:p-3 shadow-sm flex items-center justify-between gap-3 text-xs text-green-900 font-semibold anim-feed-item">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-green-700 text-white font-black flex items-center justify-center text-[10px]">
                                ✓
                            </span>
                            <span>Aspirasi Anda berhasil dikirim ke forum!</span>
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

                {/* BANNER SURVEI KSM: DISESUAIKAN DENGAN PERAN USER */}
                <div className="w-full bg-white border border-slate-200 border-l-4 border-l-hima-blue-dark p-3.5 sm:p-4 anim-feed-item flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-1.5 py-0.2 tracking-wider">
                                {isAdmin ? 'ADMIN PANEL' : 'KSM HMIF'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Kelompok Studi Mahasiswa
                            </span>
                        </div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                            {isAdmin
                                ? 'Rekapitulasi Kuesioner & Minat Teknologi Mahasiswa'
                                : 'Survei Kebutuhan Materi Matkul & Bidang Teknologi'}
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            {isAdmin
                                ? 'Pantau respon mahasiswa, statistik peminatan bidang IT, dan export data CSV.'
                                : 'Isi kuesioner peminatan untuk menentukan jadwal kelas rutin, workshop, dan mentoring KSM.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {isAdmin ? (
                            <Link
                                href={route('admin.ksm.dashboard')}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Buka Dashboard KSM →</span>
                            </Link>
                        ) : (
                            <a
                                href={route('ksm.survey.index')}
                                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Isi Survei KSM</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* 1. TAMPILAN FOKUS: FORM INPUT ASPIRASI SIMPEL & EFISIEN */}
                {activeNav === 'create' ? (
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm sm:shadow-brutal-sm anim-feed-item">
                        <div className="border-b border-gray-200 pb-3 mb-4">
                            <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase">
                                Form Aspirasi Baru
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Masukkan aspirasi dengan jelas agar mudah dipahami dan didukung oleh mahasiswa lain.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAspiration} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                    Judul Aspirasi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Contoh: Penambahan colokan listrik dan Wi-Fi di selasar Lab Komputer"
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-xs"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none rounded-none shadow-xs"
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
                                    <div className="border-2 border-hima-blue-dark p-2 bg-slate-50 flex items-center justify-between shadow-xs">
                                        <span className="text-xs font-bold text-gray-800 truncate mr-2">
                                            {formIsAnonymous ? 'Anonim (Privasi Terjaga)' : user.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                                            className={`border px-2.5 py-1 text-[10px] font-black uppercase transition-colors shrink-0 ${
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

                            {/* Isi Uraian */}
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                    Isi Aspirasi & Usulan *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Jelaskan kendala, kebutuhan, atau saran solusi yang kamu usulkan..."
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-xs resize-none"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('feed')}
                                    className="border border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-6 py-2 text-xs font-black uppercase tracking-wider shadow-sm hover:bg-hima-blue-light transition-all"
                                >
                                    Kirim Aspirasi
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* 2. TAMPILAN FEED ASPIRASI BERSIH & TIDAK RAME */
                    <div className="w-full space-y-2.5">
                        {/* Filter & Pencarian Sederhana */}
                        <div className="w-full bg-white border-2 border-hima-blue-dark p-2.5 sm:p-3 shadow-sm sm:shadow-brutal-sm space-y-2 anim-feed-item">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari aspirasi mahasiswa..."
                                        className="w-full px-2.5 py-1.5 border border-hima-blue-dark sm:border-2 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none rounded-none shadow-xs"
                                    />
                                </div>

                                {/* Tombol Sortir Bersih */}
                                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('trending')}
                                        className={`inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all ${
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
                                        className={`border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all ${
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
                                        className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
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

                        {/* List Aspirasi Cards - Minimalis, Lega, Friendly */}
                        {filteredAspirations.length === 0 ? (
                            <div className="w-full bg-white border-2 border-hima-blue-dark p-8 text-center shadow-sm anim-feed-item">
                                <p className="text-xs sm:text-sm font-black uppercase text-hima-blue-dark">
                                    Belum Ada Aspirasi
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    {searchQuery
                                        ? 'Tidak ada aspirasi yang cocok dengan kata kunci pencarian.'
                                        : 'Jadilah yang pertama menuliskan aspirasi kamu!'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('create')}
                                    className="mt-3 inline-flex items-center gap-1.5 border border-hima-blue-dark bg-hima-blue-dark text-white px-3.5 py-1.5 text-xs font-bold uppercase hover:bg-hima-blue-light"
                                >
                                    + Tulis Aspirasi Sekarang
                                </button>
                            </div>
                        ) : (
                            filteredAspirations.map((item, index) => {
                                const isCommentsOpen = openCommentId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        className="w-full bg-white border-2 border-hima-blue-dark p-3.5 sm:p-4 shadow-sm sm:shadow-brutal-sm transition-all duration-150 anim-feed-item space-y-2 hover:border-hima-blue-light"
                                    >
                                        {/* Baris Kategori & Waktu Bersih */}
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>

                                            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">
                                                {item.createdAt}
                                            </span>
                                        </div>

                                        {/* Judul Aspirasi */}
                                        <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight leading-snug">
                                            {item.title}
                                        </h3>

                                        {/* Uraian Aspirasi */}
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                            {item.content}
                                        </p>

                                        {/* Footer Kartu Sederhana */}
                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                                            {/* Info Penulis Ringkas */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate max-w-[50%]">
                                                <div className="w-5 h-5 bg-hima-blue-dark text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                                    {item.authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-800 truncate">
                                                    {item.authorName}
                                                </span>
                                            </div>

                                            {/* Aksi Vote & Tanggapan */}
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
