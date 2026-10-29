import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface AspirationItem {
    id: number;
    title: string;
    category: string;
    content: string;
    authorName: string;
    authorNim: string;
    isAnonymous: boolean;
    status: 'baru' | 'kurasi' | 'ksm' | 'tindak_lanjut';
    votes: number;
    hasVoted: boolean;
    createdAt: string;
    commentsCount: number;
}

const INITIAL_ASPIRATIONS: AspirationItem[] = [
    {
        id: 1,
        title: 'Penambahan Kapasitas RAM & Update Tool AI di Lab Komputer 3',
        category: 'Fasilitas & Lab',
        content: 'Saat praktikum Machine Learning & Mobile Programming, PC di Lab 3 sering mengalami lag dan freeze saat emulator Android Studio dijalankan bersamaan. Mohon diajukan penambahan RAM menjadi minimal 16GB dan update SSD.',
        authorName: 'Rian Pratama',
        authorNim: '230414012',
        isAnonymous: false,
        status: 'ksm',
        votes: 42,
        hasVoted: false,
        createdAt: '3 jam lalu',
        commentsCount: 9,
    },
    {
        id: 2,
        title: 'Pengadaan Akun GitHub Enterprise & JetBrains Student Pack Kampus',
        category: 'Akademik & Kurikulum',
        content: 'Banyak mahasiswa terkendala verifikasi email saat klaim JetBrains dan Copilot. Alangkah baiknya jika HIMA memfasilitasi kerja sama atau panduan kolektif lisensi software dev untuk seluruh angkatan.',
        authorName: 'Mahasiswa IF',
        authorNim: '240414***',
        isAnonymous: true,
        status: 'kurasi',
        votes: 38,
        hasVoted: false,
        createdAt: '5 jam lalu',
        commentsCount: 14,
    },
    {
        id: 3,
        title: 'Perbaikan Stabilitas Wi-Fi Gedung B Lantai 2 Khusus Jam Kuliah',
        category: 'Fasilitas & Lab',
        content: 'Koneksi Wi-Fi sering terputus mendadak terutama pada jam 10.00 - 14.00 WIB. Mengingat sebagian besar materi praktikum dan submit tugas menggunakan LMS cloud, hal ini sangat mengganggu.',
        authorName: 'Siti Nurhaliza',
        authorNim: '220414005',
        isAnonymous: false,
        status: 'tindak_lanjut',
        votes: 65,
        hasVoted: true,
        createdAt: '1 hari lalu',
        commentsCount: 21,
    },
    {
        id: 4,
        title: 'Workshop Persiapan Magang Industri & Bootcamp Fast-Track Portofolio',
        category: 'Kemahasiswaan & HIMA',
        content: 'Usulan program kerja untuk Divisi Diklat HMIF: adakan simulasi tech-interview (live coding + system design) dan review CV ATS khusus mahasiswa semester 4 ke atas sebelum mendaftar MSIB / magang mandiri.',
        authorName: 'Ahmad Fauzi',
        authorNim: '230414088',
        isAnonymous: false,
        status: 'baru',
        votes: 19,
        hasVoted: false,
        createdAt: '2 hari lalu',
        commentsCount: 5,
    },
];

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

    // Navigasi Tampilan (feed / create / my)
    const [activeNav, setActiveNav] = useState<'feed' | 'create' | 'my'>('feed');

    // Data State Aspirasi
    const [aspirations, setAspirations] = useState<AspirationItem[]>(INITIAL_ASPIRATIONS);
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [sortBy, setSortBy] = useState<'trending' | 'terbaru'>('trending');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State Form Aspirasi Baru
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('Akademik & Kurikulum');
    const [formContent, setFormContent] = useState('');
    const [formIsAnonymous, setFormIsAnonymous] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Toggle Upvote Interaktif
    const handleToggleVote = (id: number) => {
        setAspirations((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newHasVoted = !item.hasVoted;
                    return {
                        ...item,
                        hasVoted: newHasVoted,
                        votes: newHasVoted ? item.votes + 1 : item.votes - 1,
                    };
                }
                return item;
            }),
        );
    };

    // Submit Aspirasi Baru
    const handleSubmitAspiration = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formContent.trim()) return;

        const newAspiration: AspirationItem = {
            id: Date.now(),
            title: formTitle.trim(),
            category: formCategory,
            content: formContent.trim(),
            authorName: formIsAnonymous ? 'Mahasiswa IF' : user.name,
            authorNim: formIsAnonymous ? `${userNim.slice(0, 5)}***` : userNim,
            isAnonymous: formIsAnonymous,
            status: 'baru',
            votes: 1,
            hasVoted: true,
            createdAt: 'Baru saja',
            commentsCount: 0,
        };

        setAspirations([newAspiration, ...aspirations]);
        setFormTitle('');
        setFormContent('');
        setFormIsAnonymous(false);
        setShowSuccessAlert(true);
        setActiveNav('feed');

        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 5000);
    };

    // Filter & Sort Data
    const filteredAspirations = useMemo(() => {
        return aspirations
            .filter((item) => {
                if (activeNav === 'my') {
                    if (item.authorNim !== userNim && !item.isAnonymous) {
                        return false;
                    }
                }

                if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
                    return false;
                }

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

    const getStatusBadge = (status: AspirationItem['status']) => {
        switch (status) {
            case 'ksm':
                return (
                    <span className="bg-red-50 border border-hima-red-dark text-hima-red-dark px-2 py-0.5 text-[10px] font-black uppercase">
                        Siap Masuk KSM
                    </span>
                );
            case 'kurasi':
                return (
                    <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[10px] font-black uppercase">
                        Tahap Kurasi
                    </span>
                );
            case 'tindak_lanjut':
                return (
                    <span className="bg-green-50 border border-green-700 text-green-800 px-2 py-0.5 text-[10px] font-black uppercase">
                        Ditindaklanjuti
                    </span>
                );
            case 'baru':
            default:
                return (
                    <span className="bg-gray-100 border border-gray-400 text-gray-700 px-2 py-0.5 text-[10px] font-black uppercase">
                        Aspirasi Baru
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            activeNav={activeNav}
            onSelectNav={(nav) => setActiveNav(nav as 'feed' | 'create' | 'my')}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                            {activeNav === 'create'
                                ? 'Form Aspirasi Mahasiswa'
                                : activeNav === 'my'
                                ? 'Aspirasi Saya'
                                : 'Forum Aspirasi Mahasiswa'}
                        </h1>
                        <p className="text-xs text-gray-600 font-medium">
                            {activeNav === 'create'
                                ? 'Tuliskan aspirasi, keluhan fasilitas, atau saran akademik Anda secara terarah.'
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
                                className="inline-flex items-center gap-1.5 border-2 border-gray-400 bg-white text-gray-700 px-3.5 py-1.5 text-xs font-bold uppercase hover:bg-gray-50"
                            >
                                ← Kembali ke Feed
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Portal Aspirasi Mahasiswa" />

            {/* FULL WIDTH CONTAINER */}
            <div className="w-full space-y-3">
                {/* Notifikasi Sukses Sederhana */}
                {showSuccessAlert && (
                    <div className="w-full bg-green-50 border-2 border-green-700 p-3 shadow-brutal-sm flex items-center justify-between gap-3 text-xs text-green-900 font-semibold">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-green-700 text-white font-black flex items-center justify-center text-[10px]">
                                ✓
                            </span>
                            <span>Aspirasi Anda berhasil dikirim dan masuk dalam antrean kurasi HMIF!</span>
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

                {/* 1. TAMPILAN FOKUS: FORM INPUT ASPIRASI (FULL WIDTH) */}
                {activeNav === 'create' ? (
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-sm">
                        <div className="border-b border-gray-200 pb-3 mb-5">
                            <h2 className="text-base sm:text-lg font-black text-hima-blue-dark uppercase">
                                Tulis Masukan & Aspirasi
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Masukkan detail aspirasi dengan jelas agar mudah dikaji oleh tim HIMA IF.
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
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                                    autoFocus
                                />
                            </div>

                            {/* Kategori & Identitas dalam 2 Kolom Rapi */}
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
                                            className={`border px-2 py-0.5 text-[10px] font-black uppercase ${
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
                                    Uraian Masalah & Usulan Solusi *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Jelaskan kendala yang dialami serta rekomendasi solusi yang diharapkan..."
                                    className="w-full border-2 border-hima-blue-dark bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('feed')}
                                    className="border-2 border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50"
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
                    /* 2. TAMPILAN FEED ASPIRASI (BERSIH, TANPA KOTAK VOTE KIRI YANG KAKU) */
                    <div className="w-full space-y-3">
                        {/* Filter & Pencarian Full Width */}
                        <div className="w-full bg-white border-2 border-hima-blue-dark p-3 sm:p-3.5 shadow-brutal-sm space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari aspirasi mahasiswa..."
                                        className="w-full px-3 py-1.5 border-2 border-hima-blue-dark text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                                    />
                                </div>

                                {/* Urutan */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('trending')}
                                        className={`border px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                                            sortBy === 'trending'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                : 'bg-white text-gray-700 border-gray-300'
                                        }`}
                                    >
                                        🔥 Terbanyak Vote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSortBy('terbaru')}
                                        className={`border px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                                            sortBy === 'terbaru'
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                : 'bg-white text-gray-700 border-gray-300'
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
                                        className={`px-2.5 py-0.5 text-[11px] font-bold uppercase whitespace-nowrap border ${
                                            selectedCategory === cat
                                                ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-white'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Aspirasi Cards (Bersih, Rapi & Lapang) */}
                        {filteredAspirations.length === 0 ? (
                            <div className="w-full bg-white border-2 border-hima-blue-dark p-8 text-center shadow-brutal-sm">
                                <p className="text-sm font-black uppercase text-hima-blue-dark">
                                    Belum Ada Aspirasi
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {searchQuery ? 'Tidak ada hasil yang sesuai dengan pencarian.' : 'Mulai sampaikan aspirasi pertama Anda.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('create')}
                                    className="mt-3 border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-4 py-1.5 text-xs font-black uppercase"
                                >
                                    + Tulis Aspirasi
                                </button>
                            </div>
                        ) : (
                            filteredAspirations.map((item) => (
                                <div
                                    key={item.id}
                                    className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm hover:border-hima-blue-light transition-all space-y-2.5"
                                >
                                    {/* Baris Status & Kategori Tag */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {getStatusBadge(item.status)}
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                            {item.category} • {item.createdAt}
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-500">
                                                💬 {item.commentsCount} Tanggapan
                                            </span>

                                            {/* Tombol Voting Compact Horizontal */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVote(item.id)}
                                                aria-label={`Dukung aspirasi: ${item.title}`}
                                                className={`btn-brutal inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                                                    item.hasVoted
                                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
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
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
