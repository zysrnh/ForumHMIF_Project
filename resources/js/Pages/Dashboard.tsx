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
        category: 'Fasilitas Lab Komputer',
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
        category: 'Fasilitas Kampus & Wi-Fi',
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
    'Fasilitas Lab Komputer',
    'Fasilitas Kampus & Wi-Fi',
    'Kemahasiswaan & HIMA',
    'Kebijakan Kampus',
];

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');

    // State Navigasi
    const [activeNav, setActiveNav] = useState<'feed' | 'create' | 'my'>('feed');

    // State Aspirasi
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

    // Toggle Upvote
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
                // Navigasi Filter: Aspirasi Saya
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
                    const matchCategory = item.category.toLowerCase().includes(query);
                    if (!matchTitle && !matchContent && !matchCategory) {
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
                    <span className="inline-flex items-center gap-1 bg-red-100 border border-hima-red-dark text-hima-red-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-hima-red-dark" />
                        Siap Masuk KSM
                    </span>
                );
            case 'kurasi':
                return (
                    <span className="inline-flex items-center gap-1 bg-blue-100 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-hima-blue-dark" />
                        Tahap Kurasi Ristek
                    </span>
                );
            case 'tindak_lanjut':
                return (
                    <span className="inline-flex items-center gap-1 bg-green-100 border border-green-800 text-green-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-green-700" />
                        Ditindaklanjuti Kampus
                    </span>
                );
            case 'baru':
            default:
                return (
                    <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-600 text-gray-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-gray-600" />
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-hima-blue-dark text-white text-[10px] font-black uppercase px-2 py-0.5">
                                Dashboard Mahasiswa
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-600">
                                NIM: {userNim}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-hima-blue-dark tracking-tight uppercase mt-1">
                            Forum Aspirasi & Advokasi HMIF
                        </h1>
                        <p className="text-xs font-semibold text-gray-600">
                            Sampaikan keluhan, kritik konstruktif, dan rekomendasi solusi untuk prodi Informatika & kampus.
                        </p>
                    </div>

                    {/* Quick Button Tulis Aspirasi */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveNav(activeNav === 'create' ? 'feed' : 'create')}
                            className="btn-brutal inline-flex items-center gap-2 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{activeNav === 'create' ? 'Lihat Feed Aspirasi' : 'Tulis Aspirasi Baru'}</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Aspirasi Mahasiswa" />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Notifikasi Sukses */}
                {showSuccessAlert && (
                    <div className="bg-green-100 border-2 border-green-800 p-4 shadow-brutal-sm flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-700 text-white font-black flex items-center justify-center shrink-0 border border-green-900">
                                ✓
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-green-900">
                                    Aspirasi Berhasil Terkirim!
                                </p>
                                <p className="text-xs text-green-800 font-medium mt-0.5">
                                    Suara kamu telah masuk ke sistem dan akan dikurasi oleh Divisi Ristek HMIF untuk agenda KSM berikutnya.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowSuccessAlert(false)}
                            className="text-green-900 hover:text-black font-bold text-xs"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* FORM INPUT ASPIRASI BARU (Tampil jika activeNav === 'create' atau toggle) */}
                {activeNav === 'create' && (
                    <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg">
                        <div className="border-b-2 border-hima-blue-dark pb-4 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-hima-red-dark text-white px-2 py-0.5 inline-block mb-1">
                                Form Advokasi Suara
                            </span>
                            <h2 className="text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                                Sampaikan Aspirasi Anda
                            </h2>
                            <p className="text-xs font-medium text-gray-600 mt-1">
                                Setiap aspirasi yang diajukan akan ditinjau dan dikurasi oleh tim HIMA IF sebelum dibawa ke forum KSM bersama pimpinan prodi.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAspiration} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-hima-blue-dark mb-1">
                                    Judul Aspirasi <span className="text-hima-red-dark">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Contoh: Penambahan Kapasitas Server Praktikum Cloud Computing"
                                    className="w-full border-2 border-hima-blue-dark bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:ring-0 shadow-brutal-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-hima-blue-dark mb-1">
                                        Kategori Aspirasi <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full border-2 border-hima-blue-dark bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-hima-blue-light focus:ring-0 shadow-brutal-sm"
                                    >
                                        <option value="Akademik & Kurikulum">Akademik & Kurikulum</option>
                                        <option value="Fasilitas Lab Komputer">Fasilitas Lab Komputer</option>
                                        <option value="Fasilitas Kampus & Wi-Fi">Fasilitas Kampus & Wi-Fi</option>
                                        <option value="Kemahasiswaan & HIMA">Kemahasiswaan & HIMA</option>
                                        <option value="Kebijakan Kampus">Kebijakan Kampus</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-hima-blue-dark mb-1">
                                        Identitas Pengirim
                                    </label>
                                    <div className="border-2 border-hima-blue-dark p-2.5 bg-blue-50/50 flex items-center justify-between shadow-brutal-sm">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">
                                                {formIsAnonymous ? 'Anonim (Rahasia)' : `${user.name} (${userNim})`}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {formIsAnonymous ? 'Nama & NIM Anda tidak akan ditampilkan ke publik' : 'Identitas terverifikasi fellow kampus'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                                            className={`border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
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

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-hima-blue-dark mb-1">
                                    Deskripsi & Rekomendasi Solusi <span className="text-hima-red-dark">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Uraikan kendala yang dialami secara rinci, lokasi/waktu kejadian, dan solusi konkret yang Anda harapkan dari pihak kampus/himpunan..."
                                    className="w-full border-2 border-hima-blue-dark bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:ring-0 shadow-brutal-sm"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-gray-200">
                                <p className="text-[11px] font-medium text-gray-500">
                                    Pastikan aspirasi menggunakan bahasa yang sopan, solutif, dan tidak melanggar kode etik kampus.
                                </p>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setActiveNav('feed')}
                                        className="w-full sm:w-auto border-2 border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-brutal w-full sm:w-auto border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-6 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light"
                                    >
                                        Kirim Aspirasi Sekarang
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* FILTER & PENCARIAN ASPIRASI */}
                <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari aspirasi berdasarkan topik, kata kunci, atau lab..."
                                className="w-full pl-9 pr-3.5 py-2 border-2 border-hima-blue-dark text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-hima-blue-light focus:ring-0 shadow-brutal-sm"
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-black uppercase text-gray-600">Urutkan:</span>
                            <button
                                type="button"
                                onClick={() => setSortBy('trending')}
                                className={`border-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                                    sortBy === 'trending'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
                                        : 'bg-white text-gray-700 border-gray-400 hover:border-hima-blue-dark'
                                }`}
                            >
                                🔥 Terbanyak Vote
                            </button>
                            <button
                                type="button"
                                onClick={() => setSortBy('terbaru')}
                                className={`border-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                                    sortBy === 'terbaru'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
                                        : 'bg-white text-gray-700 border-gray-400 hover:border-hima-blue-dark'
                                }`}
                            >
                                ⏳ Terbaru
                            </button>
                        </div>
                    </div>

                    {/* Kategori Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-2 transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark shadow-brutal-sm'
                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-hima-blue-dark hover:bg-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LIST FEED ASPIRASI */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-hima-blue-dark">
                                {activeNav === 'my' ? 'Daftar Aspirasi Saya' : 'Daftar Aspirasi Mahasiswa'}
                            </span>
                            <span className="bg-hima-blue-dark text-white text-[10px] font-black px-1.5 py-0.2">
                                {filteredAspirations.length} Topik
                            </span>
                        </div>
                        {activeNav === 'my' && (
                            <button
                                type="button"
                                onClick={() => setActiveNav('feed')}
                                className="text-xs font-bold text-hima-blue-light hover:underline uppercase"
                            >
                                ← Kembali ke Semua Aspirasi
                            </button>
                        )}
                    </div>

                    {filteredAspirations.length === 0 ? (
                        <div className="bg-white border-2 border-hima-blue-dark p-12 text-center shadow-brutal">
                            <p className="text-base font-black uppercase text-hima-blue-dark">
                                Belum Ada Aspirasi Ditemukan
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {searchQuery
                                    ? `Tidak ada aspirasi yang cocok dengan kata kunci "${searchQuery}".`
                                    : 'Jadilah yang pertama menyampaikan suara dan masukan Anda untuk kemajuan himpunan!'}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('Semua');
                                    setActiveNav('create');
                                }}
                                className="mt-4 border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light"
                            >
                                + Tulis Aspirasi Pertama
                            </button>
                        </div>
                    ) : (
                        filteredAspirations.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal hover:border-hima-blue-light transition-all flex flex-col sm:flex-row items-start gap-4"
                            >
                                {/* Tombol Upvote / Voting Kolom */}
                                <div className="sm:self-stretch flex sm:flex-col items-center justify-center shrink-0 w-full sm:w-16">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleVote(item.id)}
                                        aria-label={`Upvote aspirasi: ${item.title}`}
                                        className={`btn-brutal w-full flex sm:flex-col items-center justify-center gap-1.5 py-2 px-3 sm:py-3 border-2 transition-all ${
                                            item.hasVoted
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm'
                                                : 'bg-white text-hima-blue-dark border-hima-blue-dark hover:bg-blue-50'
                                        }`}
                                    >
                                        <svg
                                            className={`w-5 h-5 transition-transform ${item.hasVoted ? 'translate-y-[-2px]' : ''}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="font-black text-sm sm:text-base leading-none">
                                            {item.votes}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider block sm:inline">
                                            {item.hasVoted ? 'Didukung' : 'Dukung'}
                                        </span>
                                    </button>
                                </div>

                                {/* Konten Aspirasi */}
                                <div className="flex-1 min-w-0">
                                    {/* Status & Kategori Tag */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {getStatusBadge(item.status)}
                                        <span className="bg-gray-100 border border-gray-400 text-gray-800 text-[10px] font-bold uppercase px-2 py-0.5">
                                            {item.category}
                                        </span>
                                        <span className="text-[11px] font-semibold text-gray-500">
                                            • {item.createdAt}
                                        </span>
                                    </div>

                                    {/* Judul Aspirasi */}
                                    <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight leading-snug">
                                        {item.title}
                                    </h3>

                                    {/* Isi Uraian Aspirasi */}
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mt-2 leading-relaxed">
                                        {item.content}
                                    </p>

                                    {/* Author & Tanggapan Bar */}
                                    <div className="mt-4 pt-3 border-t-2 border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                            <div className="w-6 h-6 bg-hima-blue-dark text-white border border-hima-blue-dark flex items-center justify-center font-black text-[10px]">
                                                {item.authorName.charAt(0)}
                                            </div>
                                            <span>
                                                Oleh: <strong className="text-hima-blue-dark">{item.authorName}</strong> ({item.authorNim})
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {item.commentsCount} Tanggapan
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVote(item.id)}
                                                className="text-[11px] font-black uppercase text-hima-blue-dark hover:underline"
                                            >
                                                {item.hasVoted ? '✓ Diberi Suara' : '+ Beri Dukungan Suara'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
