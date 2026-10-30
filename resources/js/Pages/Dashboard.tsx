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
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface SurveyItem {
    id: number;
    respondent_name: string;
    respondent_nim?: string;
    respondent_class?: string;
    semester_course: string;
    interested_fields: string[];
    activity_types: string[];
    learning_method: string;
    interest_scale: number;
    preferred_days: string[];
    preferred_time: string;
    feedback?: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface KsmData {
    surveys: {
        data: SurveyItem[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        avgInterest: number;
        topField: string;
        topDay: string;
        topTime: string;
        courseDistribution: Record<string, number>;
        fieldDistribution: Record<string, number>;
        activityDistribution: Record<string, number>;
        dayDistribution: Record<string, number>;
        timeDistribution: Record<string, number>;
    };
    filters: {
        search?: string;
    };
}

interface DashboardProps {
    ksmData?: KsmData | null;
}

export default function Dashboard({ ksmData }: DashboardProps) {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');
    const isAdmin = ['admin', 'super_admin', 'superadmin'].includes(user.role || '');

    // Navigasi Tampilan yang Sederhana (feed / create / my / ksm)
    const [activeNav, setActiveNav] = useState<'feed' | 'create' | 'my' | 'ksm'>('feed');

    // Data State Aspirasi Tersinkronisasi
    const [aspirations, setAspirations] = useState<AspirationItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [sortBy, setSortBy] = useState<'trending' | 'terbaru'>('trending');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State Accordion Tanggapan Aspirasi
    const [openCommentId, setOpenCommentId] = useState<number | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [aspirationId: number]: string }>({});

    // State Form Aspirasi Baru yang Bersih & Efisien
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState<string>('Akademik & Praktikum');
    const [formContent, setFormContent] = useState('');
    const [formIsAnonymous, setFormIsAnonymous] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // State Data KSM (Khusus Admin)
    const [ksmSearch, setKsmSearch] = useState(ksmData?.filters?.search || '');
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null);

    // Sinkronisasi Tab dari URL query parameter jika ada
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'ksm' && isAdmin) {
            setActiveNav('ksm');
        } else if (tabParam === 'create') {
            setActiveNav('create');
        } else if (tabParam === 'my') {
            setActiveNav('my');
        } else if (tabParam === 'feed') {
            setActiveNav('feed');
        }
    }, [isAdmin]);

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

    // Submit Aspirasi Baru
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

    // Handler Pencarian KSM untuk Admin
    const handleKsmSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('dashboard'),
            { tab: 'ksm', search: ksmSearch },
            { preserveState: true, replace: true },
        );
    };

    // Filter & Sort Data Aspirasi
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

    return (
        <AuthenticatedLayout
            activeNav={activeNav}
            onSelectNav={(nav) => setActiveNav(nav as 'feed' | 'create' | 'my' | 'ksm')}
            header={
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-base sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                            {activeNav === 'create'
                                ? 'Tulis Aspirasi'
                                : activeNav === 'my'
                                ? 'Aspirasi Saya'
                                : activeNav === 'ksm'
                                ? 'Rekapitulasi Data Survei KSM'
                                : 'Forum Aspirasi Mahasiswa'}
                        </h1>
                        <p className="hidden sm:block text-xs text-gray-600 font-medium mt-0.5">
                            {activeNav === 'create'
                                ? 'Sampaikan ide, masukan, atau kendala fasilitas kamu secara langsung.'
                                : activeNav === 'my'
                                ? 'Daftar seluruh aspirasi yang pernah kamu sampaikan ke forum.'
                                : activeNav === 'ksm'
                                ? 'Data survei peminatan teknologi, kebutuhan materi, dan jadwal belajar mahasiswa HIMA IF.'
                                : 'Suarakan masukan dan dukung aspirasi rekan mahasiswa Teknik Informatika.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeNav === 'ksm' ? (
                            <a
                                href={route('admin.ksm.export')}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export CSV</span>
                            </a>
                        ) : activeNav !== 'create' ? (
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
                {/* TAB NAVIGASI MINIMALIS DI ATAS KONTEN */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveNav('feed')}
                        className={`px-3 py-1.5 font-bold uppercase transition-all ${
                            activeNav === 'feed'
                                ? 'bg-hima-blue-dark text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Semua Aspirasi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveNav('create')}
                        className={`px-3 py-1.5 font-bold uppercase transition-all ${
                            activeNav === 'create'
                                ? 'bg-hima-blue-dark text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Tulis Aspirasi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveNav('my')}
                        className={`px-3 py-1.5 font-bold uppercase transition-all ${
                            activeNav === 'my'
                                ? 'bg-hima-blue-dark text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Aspirasi Saya
                    </button>

                    {/* TAB KHUSUS ADMIN (DISEMBUNYIKAN UNTUK MAHASISWA) */}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setActiveNav('ksm')}
                            className={`px-3 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 ${
                                activeNav === 'ksm'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span>Rekap Data KSM</span>
                            <span
                                className={`text-[8px] font-black uppercase px-1 py-0.2 ${
                                    activeNav === 'ksm'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                                ADMIN
                            </span>
                        </button>
                    )}
                </div>

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

                {/* ========================================================================= */}
                {/* 1. TAMPILAN REKAP DATA KSM (KHUSUS ADMIN)                                 */}
                {/* ========================================================================= */}
                {activeNav === 'ksm' && isAdmin && ksmData ? (
                    <div className="w-full space-y-4 anim-feed-item">
                        {/* Metrik Statistik Flat Minimalis */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white border border-slate-200 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Total Responden
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-slate-900 font-mono">
                                        {ksmData.stats.total}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">Mahasiswa</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Rata-rata Minat
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-red-600 font-mono">
                                        {ksmData.stats.avgInterest}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">/ 4.0 Skala</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Top Bidang Teknologi
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={ksmData.stats.topField}>
                                    {ksmData.stats.topField}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-600 block">
                                    Paling Banyak Dipilih
                                </span>
                            </div>

                            <div className="bg-white border border-slate-200 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Jadwal Terfavorit
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                                    {ksmData.stats.topDay} ({ksmData.stats.topTime})
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 block">
                                    Pilihan Terbanyak
                                </span>
                            </div>
                        </div>

                        {/* Distribusi Singkat Flat */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                            {/* Distribusi Bidang */}
                            <div className="bg-white border border-slate-200 p-3.5 space-y-2.5">
                                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                                        Peminatan Bidang Teknologi
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-400">Maks. 3 Pilihan</span>
                                </div>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {Object.keys(ksmData.stats.fieldDistribution).length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-2">Belum ada data peminatan.</p>
                                    ) : (
                                        Object.entries(ksmData.stats.fieldDistribution).map(([field, count]) => {
                                            const pct = ksmData.stats.total > 0 ? Math.round((count / ksmData.stats.total) * 100) : 0;
                                            return (
                                                <div key={field} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                        <span>{field}</span>
                                                        <span className="font-mono text-slate-500">{count} mhs ({pct}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-hima-blue-dark h-full"
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Bentuk Kegiatan & Jadwal */}
                            <div className="bg-white border border-slate-200 p-3.5 space-y-2.5">
                                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                                        Bentuk Kegiatan Pilihan
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-400">Maks. 2 Pilihan</span>
                                </div>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {Object.entries(ksmData.stats.activityDistribution).map(([act, count]) => {
                                        const pct = ksmData.stats.total > 0 ? Math.round((count / ksmData.stats.total) * 100) : 0;
                                        return (
                                            <div key={act} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                    <span>{act}</span>
                                                    <span className="font-mono text-slate-500">{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-red-600 h-full"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Tabel Data Responden Flat Minimalis */}
                        <div className="bg-white border border-slate-200 p-3.5 sm:p-5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                                        Daftar Responden Survei ({ksmData.surveys.total})
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Respon kuesioner mahasiswa HIMA IF untuk perencanaan program KSM.
                                    </p>
                                </div>

                                <form onSubmit={handleKsmSearch} className="flex gap-1 sm:w-64">
                                    <input
                                        type="text"
                                        value={ksmSearch}
                                        onChange={(e) => setKsmSearch(e.target.value)}
                                        placeholder="Cari nama, NIM, kelas..."
                                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 focus:outline-none focus:border-slate-800"
                                    />
                                    <button
                                        type="submit"
                                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase transition-colors"
                                    >
                                        Cari
                                    </button>
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="p-2.5">No</th>
                                            <th className="p-2.5">Responden</th>
                                            <th className="p-2.5">Kelas</th>
                                            <th className="p-2.5">Matkul Smt 3</th>
                                            <th className="p-2.5">Bidang Minat</th>
                                            <th className="p-2.5">Jadwal</th>
                                            <th className="p-2.5">Minat</th>
                                            <th className="p-2.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {ksmData.surveys.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                                                    Belum ada data responden yang sesuai.
                                                </td>
                                            </tr>
                                        ) : (
                                            ksmData.surveys.data.map((item, idx) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-2.5 font-mono text-slate-400">
                                                        {(ksmData.surveys.current_page - 1) * 15 + idx + 1}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="font-bold text-slate-900 block">
                                                            {item.respondent_name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {item.respondent_nim || 'Tanpa NIM'}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="inline-block bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                                                            {item.respondent_class || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 font-medium text-slate-800">
                                                        {item.semester_course}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                                            {item.interested_fields?.map((f) => (
                                                                <span
                                                                    key={f}
                                                                    className="bg-blue-50 text-hima-blue-dark border border-blue-100 text-[10px] font-medium px-1.5 py-0.2"
                                                                >
                                                                    {f}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-2.5 text-[11px]">
                                                        <span className="block font-medium text-slate-800">
                                                            {item.preferred_days?.join(', ') || '-'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.preferred_time}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className="inline-block bg-slate-100 text-slate-800 font-bold font-mono text-[10px] px-1.5 py-0.2 border border-slate-200">
                                                            Skala {item.interest_scale}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSurvey(item)}
                                                            className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-900 hover:text-white px-2 py-0.5 text-[11px] font-semibold transition-colors"
                                                        >
                                                            Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Links */}
                            {ksmData.surveys.links && ksmData.surveys.links.length > 3 && (
                                <div className="flex items-center justify-end gap-1 pt-2.5 border-t border-slate-100">
                                    {ksmData.surveys.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-2.5 py-1 text-xs border font-medium transition-all ${
                                                link.active
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : link.url
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Detail Responden */}
                        {selectedSurvey && (
                            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
                                <div className="bg-white border border-slate-300 w-full max-w-lg p-5 shadow-lg space-y-3.5 max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">
                                                Detail Responden KSM
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                {selectedSurvey.respondent_name} ({selectedSurvey.respondent_nim || 'Tanpa NIM'})
                                                {selectedSurvey.respondent_class ? ` • Kelas: ${selectedSurvey.respondent_class}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSurvey(null)}
                                            className="text-slate-400 hover:text-slate-700 p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-3 text-xs">
                                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2.5">
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[9px] block">
                                                    Kelas Mahasiswa:
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    {selectedSurvey.respondent_class || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[9px] block">
                                                    NIM:
                                                </span>
                                                <span className="font-bold text-slate-900 font-mono">
                                                    {selectedSurvey.respondent_nim || '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-0.5">
                                                Materi Matkul Smt 3:
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {selectedSurvey.semester_course}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-1">
                                                Bidang Minat:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedSurvey.interested_fields?.map((f) => (
                                                    <span key={f} className="bg-blue-50 text-hima-blue-dark border border-blue-100 px-2 py-0.5 font-medium">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-1">
                                                Bentuk Kegiatan:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedSurvey.activity_types?.map((act) => (
                                                    <span key={act} className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 font-medium">
                                                        {act}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-0.5">
                                                Metode Belajar:
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {selectedSurvey.learning_method}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2.5">
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[9px] block">
                                                    Jadwal:
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    {selectedSurvey.preferred_days?.join(', ')} ({selectedSurvey.preferred_time})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[9px] block">
                                                    Skala Minat:
                                                </span>
                                                <span className="font-bold text-hima-blue-dark font-mono">
                                                    Skala {selectedSurvey.interest_scale} / 4
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-1">
                                                Saran / Usulan:
                                            </span>
                                            <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-600 italic">
                                                {selectedSurvey.feedback || 'Tidak ada catatan tambahan.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2.5 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSurvey(null)}
                                            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1 text-xs font-bold uppercase transition-colors"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeNav === 'create' ? (
                    /* ========================================================================= */
                    /* 2. FORM TULIS ASPIRASI BARU                                               */
                    /* ========================================================================= */
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm anim-feed-item">
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
                    /* ========================================================================= */
                    /* 3. TAMPILAN FEED ASPIRASI (SEMUA & SAYA)                                   */
                    /* ========================================================================= */
                    <div className="w-full space-y-2.5">
                        {/* Filter & Pencarian Sederhana */}
                        <div className="w-full bg-white border-2 border-hima-blue-dark p-2.5 sm:p-3 shadow-sm space-y-2 anim-feed-item">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari aspirasi mahasiswa..."
                                        className="w-full px-2.5 py-1.5 border border-hima-blue-dark text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none rounded-none shadow-xs"
                                    />
                                </div>

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

                            {/* Kategori Chips */}
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

                        {/* List Aspirasi Cards */}
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
                                        className="w-full bg-white border-2 border-hima-blue-dark p-3.5 sm:p-4 shadow-sm transition-all duration-150 anim-feed-item space-y-2 hover:border-hima-blue-light"
                                    >
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>

                                            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">
                                                {item.createdAt}
                                            </span>
                                        </div>

                                        <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight leading-snug">
                                            {item.title}
                                        </h3>

                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                            {item.content}
                                        </p>

                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate max-w-[50%]">
                                                <div className="w-5 h-5 bg-hima-blue-dark text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                                    {item.authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-800 truncate">
                                                    {item.authorName}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
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

                                        {isCommentsOpen && (
                                            <div className="pt-2.5 border-t border-dashed border-gray-300 bg-slate-50/70 p-2.5 sm:p-3 space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-wider text-hima-blue-dark">
                                                    Diskusi Mahasiswa ({item.comments.length})
                                                </div>

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
