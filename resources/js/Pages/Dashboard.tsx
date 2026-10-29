import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AspirationItem,
    addCommentSharedAspiration,
    addSharedAspiration,
    getSharedAspirations,
    subscribeAspirations,
    toggleVoteSharedAspiration,
} from '@/data/aspirations';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const CATEGORIES = [
    'Semua',
    'Akademik & Kurikulum',
    'Fasilitas & Lab',
    'Kemahasiswaan & HIMA',
    'Kebijakan Kampus',
];

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
    const [formCategory, setFormCategory] = useState('Akademik & Kurikulum');
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
                <div className="flex items-center gap-1.5">
                    <span className="bg-red-50 border border-hima-red-dark text-hima-red-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Siap Masuk KSM
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
                    <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Tahap Kurasi
                    </span>
                );
            case 'tindak_lanjut':
                return (
                    <span className="bg-sky-50 border border-hima-blue-light text-hima-blue-light px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        PROKER
                    </span>
                );
            case 'baru':
            default:
                return (
                    <span className="bg-gray-100 border border-gray-400 text-gray-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Aspirasi Baru
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            activeNav={activeNav}
            onSelectNav={(nav) => setActiveNav(nav as 'feed' | 'ksm' | 'create' | 'my')}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                                {activeNav === 'create'
                                    ? 'Form Pengajuan Aspirasi Mahasiswa'
                                    : activeNav === 'ksm'
                                    ? 'Agenda Sidang Pleno KSM HIMA IF'
                                    : activeNav === 'my'
                                    ? 'Aspirasi Saya'
                                    : 'Forum Aspirasi Mahasiswa'}
                            </h1>
                            {activeNav === 'ksm' && (
                                <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-2 py-0.5">
                                    SIDANG KSM
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">
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
                                className="btn-brutal inline-flex items-center gap-1.5 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all"
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
                                className="inline-flex items-center gap-1.5 border-2 border-gray-400 bg-white text-gray-700 px-3.5 py-1.5 text-xs font-bold uppercase hover:bg-gray-50 transition-colors"
                            >
                                ← Kembali ke Feed
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Portal Aspirasi & Sidang KSM" />

            {/* FULL WIDTH CONTAINER DENGAN MIKRO-ANIMASI */}
            <div className="w-full space-y-3">
                {/* Notifikasi Sukses Sederhana */}
                {showSuccessAlert && (
                    <div className="w-full bg-green-50 border-2 border-green-700 p-3 shadow-brutal-sm flex items-center justify-between gap-3 text-xs text-green-900 font-semibold anim-feed-item">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-green-700 text-white font-black flex items-center justify-center text-[10px]">
                                ✓
                            </span>
                            <span>Aspirasi Anda berhasil dikirim, tersinkronisasi, dan masuk dalam antrean kurasi HMIF!</span>
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
                    <div className="w-full bg-red-50 border-2 border-hima-red-dark p-4 sm:p-5 shadow-brutal-red anim-feed-item flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-hima-red-dark text-white text-[10px] font-black uppercase px-2 py-0.5">
                                    MEJA KSM HMIF
                                </span>
                                <span className="text-xs font-black uppercase text-hima-red-dark">
                                    Sidang Pleno Mahasiswa
                                </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-gray-950 mt-1">
                                Berkas Aspirasi Resmi yang Dibawa ke Sidang KSM
                            </h2>
                            <p className="text-xs text-gray-700 font-medium mt-0.5">
                                Topik di bawah ini memiliki dukungan suara tertinggi dan sedang diajukan untuk menghasilkan Surat Keputusan / Aksi Bersama Kaprodi.
                            </p>
                        </div>
                        <div className="shrink-0 bg-white border-2 border-hima-red-dark p-2.5 text-center shadow-sm">
                            <span className="text-xl font-black text-hima-red-dark font-mono block leading-none">
                                {aspirations.filter((a) => a.status === 'ksm' || a.isKsmAgenda).length}
                            </span>
                            <span className="text-[9px] font-black uppercase text-gray-600 block mt-0.5">
                                Topik KSM
                            </span>
                        </div>
                    </div>
                )}

                {/* 1. TAMPILAN FOKUS: FORM INPUT ASPIRASI */}
                {activeNav === 'create' ? (
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-sm anim-feed-item">
                        <div className="border-b border-gray-200 pb-3 mb-5">
                            <h2 className="text-base sm:text-lg font-black text-hima-blue-dark uppercase">
                                Tulis Masukan & Aspirasi
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Masukkan detail aspirasi dengan jelas agar mudah dikaji oleh tim HIMA IF dan diajukan ke KSM.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAspiration} className="space-y-4">
                            {/* Judul Aspirasi */}
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                    Judul Aspirasi / Topik Masalah *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="contoh: Penambahan Lisensi Software IDE & PC Lab 3"
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C] transition-shadow"
                                    autoFocus
                                />
                            </div>

                            {/* Kategori & Identitas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                                    >
                                        <option value="Akademik & Kurikulum">Akademik & Kurikulum</option>
                                        <option value="Fasilitas & Lab">Fasilitas & Lab Komputer</option>
                                        <option value="Kemahasiswaan & HIMA">Kemahasiswaan & HIMA</option>
                                        <option value="Kebijakan Kampus">Kebijakan Kampus</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1">
                                        Identitas Pengirim
                                    </label>
                                    <div className="border-2 border-hima-blue-dark p-2 bg-slate-50 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A467C]">
                                        <span className="text-xs font-bold text-gray-800">
                                            {formIsAnonymous ? 'Anonim (Privasi Terjaga)' : `${user.name} (${userNim})`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                                            className={`border px-2 py-0.5 text-[10px] font-black uppercase transition-colors ${
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

                            {/* OPSI USULAN KSM (FITUR KSM) */}
                            <div className="border-2 border-hima-red-dark bg-red-50/60 p-3 shadow-brutal-sm">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsKsmAgenda}
                                        onChange={(e) => setFormIsKsmAgenda(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded-none border-2 border-hima-red-dark text-hima-red-dark focus:ring-0 cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs font-black uppercase text-hima-red-dark block leading-snug">
                                            Rekomendasikan Langsung ke Agenda Sidang Pleno KSM HMIF
                                        </span>
                                        <span className="text-[11px] text-gray-600 block mt-0.5">
                                            Centang jika aspirasi ini mendesak dan menyangkut kebijakan umum satu angkatan/prodi agar diprioritaskan masuk berkas sidang KSM.
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
                                    rows={5}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Jelaskan kendala yang dialami serta rekomendasi solusi yang diharapkan..."
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C] transition-shadow"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('feed')}
                                    className="border-2 border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-6 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light"
                                >
                                    Kirim Aspirasi Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* 2. TAMPILAN FEED ASPIRASI & AGENDA KSM */
                    <div className="w-full space-y-3">
                        {/* Filter & Pencarian Full Width */}
                        <div className="w-full bg-white border-2 border-hima-blue-dark p-3 sm:p-3.5 shadow-brutal-sm space-y-2.5 anim-feed-item">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={
                                            activeNav === 'ksm'
                                                ? 'Cari berkas agenda KSM...'
                                                : 'Cari aspirasi mahasiswa...'
                                        }
                                        className="w-full px-3 py-1.5 border-2 border-hima-blue-dark text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none rounded-none shadow-[2px_2px_0px_0px_#1A467C] transition-shadow"
                                    />
                                </div>

                                {/* Urutan */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('trending')}
                                        className={`border px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                                            sortBy === 'trending'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-hima-blue-dark'
                                        }`}
                                    >
                                        🔥 Terbanyak Vote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('terbaru')}
                                        className={`border px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                                            sortBy === 'terbaru'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-hima-blue-dark'
                                        }`}
                                    >
                                        Terbaru
                                    </button>
                                </div>
                            </div>

                            {/* Kategori Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-2.5 py-0.5 text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-hima-red-dark text-white border-hima-red-dark shadow-brutal-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-white hover:border-hima-blue-dark'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Aspirasi Cards */}
                        {filteredAspirations.length === 0 ? (
                            <div className="w-full bg-white border-2 border-hima-blue-dark p-8 text-center shadow-brutal-sm anim-feed-item">
                                <p className="text-sm font-black uppercase text-hima-blue-dark">
                                    {activeNav === 'ksm'
                                        ? 'Belum Ada Berkas Agenda KSM'
                                        : 'Belum Ada Aspirasi'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {searchQuery
                                        ? 'Tidak ada hasil yang sesuai dengan pencarian.'
                                        : 'Mulai sampaikan aspirasi pertama Anda untuk dibawa ke sidang KSM.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('create')}
                                    className="mt-3 btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-4 py-1.5 text-xs font-black uppercase shadow-brutal-sm hover:bg-hima-blue-light"
                                >
                                    + Tulis Aspirasi
                                </button>
                            </div>
                        ) : (
                            filteredAspirations.map((item, index) => {
                                const isCommentsOpen = openCommentId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        className={`w-full bg-white border-2 p-4 shadow-brutal-sm hover:-translate-y-0.5 transition-all duration-200 anim-feed-item space-y-2.5 ${
                                            item.status === 'ksm' || item.isKsmAgenda
                                                ? 'border-hima-blue-dark hover:border-hima-red-dark'
                                                : 'border-hima-blue-dark hover:border-hima-blue-light'
                                        }`}
                                    >
                                        {/* Baris Status & Kategori Tag */}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {getStatusBadge(item)}
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    {item.category} • {item.createdAt}
                                                </span>
                                            </div>

                                            {item.ksmPlenoSchedule && (
                                                <span className="text-[10px] font-bold text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5">
                                                    📅 {item.ksmPlenoSchedule}
                                                </span>
                                            )}
                                        </div>

                                        {/* Judul Aspirasi */}
                                        <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight leading-snug">
                                            {item.title}
                                        </h3>

                                        {/* Uraian Aspirasi */}
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                            {item.content}
                                        </p>

                                        {/* Footer Kartu: Penulis di Kiri, Tombol Vote & Tanggapan di Kanan */}
                                        <div className="pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                            {/* Info Penulis */}
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <div className="w-5 h-5 bg-hima-blue-dark text-white text-[10px] font-black flex items-center justify-center shrink-0 border border-hima-blue-dark">
                                                    {item.authorName.charAt(0)}
                                                </div>
                                                <span>
                                                    Oleh: <strong className="text-hima-blue-dark">{item.authorName}</strong> ({item.authorNim})
                                                </span>
                                            </div>

                                            {/* Aksi Vote & Tanggapan */}
                                            <div className="flex items-center gap-2.5">
                                                {/* Tombol Buka Diskusi Tanggapan */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleComments(item.id)}
                                                    className={`inline-flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 border-2 transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                                                        isCommentsOpen
                                                            ? 'bg-blue-50 text-hima-blue-dark border-hima-blue-dark shadow-sm'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-hima-blue-dark'
                                                    }`}
                                                >
                                                    <span>💬 {item.comments.length} Tanggapan</span>
                                                    <svg
                                                        className={`w-3 h-3 transition-transform duration-200 ${
                                                            isCommentsOpen ? 'rotate-180' : ''
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Tombol Voting Compact Horizontal */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleVote(item.id)}
                                                    aria-label={`Dukung aspirasi: ${item.title}`}
                                                    className={`btn-brutal inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                                                        item.hasVoted
                                                            ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm anim-vote-pop'
                                                            : 'bg-white text-hima-blue-dark border-hima-blue-dark hover:bg-blue-50 shadow-brutal-sm'
                                                    }`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span>{item.votes}</span>
                                                    <span>{item.hasVoted ? 'Didukung' : 'Dukung'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* SECTION ACCORDION TANGGAPAN / DISKUSI KOMENTAR */}
                                        {isCommentsOpen && (
                                            <div className="pt-3 border-t-2 border-hima-blue-dark/20 bg-slate-50/80 p-3 sm:p-4 mt-2 anim-accordion-enter space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-hima-blue-dark flex items-center gap-1.5">
                                                        <span>Diskusi & Tanggapan</span>
                                                        <span className="bg-hima-blue-dark text-white px-1.5 py-0.2 text-[10px]">
                                                            {item.comments.length}
                                                        </span>
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 font-semibold">
                                                        HMIF Aspirasi Forum
                                                    </span>
                                                </div>

                                                {/* List Tanggapan */}
                                                <div className="space-y-2">
                                                    {item.comments.length === 0 ? (
                                                        <p className="text-xs text-gray-500 italic py-2">
                                                            Belum ada tanggapan. Jadilah yang pertama memberikan masukan atau solusi!
                                                        </p>
                                                    ) : (
                                                        item.comments.map((comment) => (
                                                            <div
                                                                key={comment.id}
                                                                className={`p-2.5 border-2 text-xs leading-relaxed ${
                                                                    comment.isOfficial
                                                                        ? 'bg-blue-50/80 border-hima-blue-dark shadow-sm'
                                                                        : 'bg-white border-gray-300'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="font-black text-gray-950">
                                                                            {comment.authorName}
                                                                        </span>
                                                                        {comment.isOfficial ? (
                                                                            <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-1.5 py-0.2">
                                                                                {comment.authorRole}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-mono font-semibold text-gray-500">
                                                                                ({comment.authorNim})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                                        {comment.createdAt}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-700 font-medium">
                                                                    {comment.content}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Form Tulis Tanggapan Baru */}
                                                <form
                                                    onSubmit={(e) => handleAddComment(item.id, e)}
                                                    className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
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
                                                        placeholder="Tulis tanggapan atau solusi Anda..."
                                                        className="flex-1 border-2 border-hima-blue-dark bg-white px-3 py-1.5 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light shadow-sm"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="btn-brutal bg-hima-blue-dark text-white border-2 border-hima-blue-dark px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light"
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
