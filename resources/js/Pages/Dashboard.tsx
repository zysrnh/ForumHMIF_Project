import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    APP_CATEGORIES,
    AspirationItem,
    addCommentSharedAspiration,
    addSharedAspiration,
    deleteSharedAspiration,
    deleteSharedComment,
    fetchAspirationsFromServer,
    getSharedAspirations,
    subscribeAspirations,
    toggleVoteSharedAspiration,
} from '@/data/aspirations';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBiDirectionalScrollReveal } from '@/hooks/useBiDirectionalScrollReveal';

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

interface UserItem {
    id: number;
    name: string;
    email: string;
    nim?: string;
    role?: string;
    created_at?: string;
}

interface UsersData {
    users: {
        data: UserItem[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        super_admin: number;
        admin: number;
        mahasiswa: number;
    };
}

interface DashboardProps {
    ksmData?: KsmData | null;
    usersData?: UsersData | null;
    currentTab?: string;
}

export default function Dashboard({ ksmData, usersData, currentTab }: DashboardProps) {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');
    const isAdmin = ['admin', 'super_admin', 'superadmin'].includes(user.role || '');
    const isSuperAdmin = user.role === 'super_admin' || user.role === 'superadmin';

    // Inisialisasi Tab Aktif berdasarkan props server atau URL query
    const initialNav = useMemo<'feed' | 'create' | 'my' | 'ksm' | 'users'>(() => {
        const tab = currentTab || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null);
        if (tab === 'ksm' && isAdmin) return 'ksm';
        if (tab === 'users' && isAdmin) return 'users';
        if (tab === 'create') return 'create';
        if (tab === 'my') return 'my';
        return 'feed';
    }, [currentTab, isAdmin]);

    const [activeNav, setActiveNav] = useState<'feed' | 'create' | 'my' | 'ksm' | 'users'>(initialNav);

    // Aktifkan scroll reveal masuk-keluar interaktif dan sinkronkan dengan pergantian tab
    useBiDirectionalScrollReveal([activeNav]);

    // Sinkronisasi Tab jika query berubah
    useEffect(() => {
        if (currentTab === 'ksm' && isAdmin) {
            setActiveNav('ksm');
        } else if (currentTab === 'users' && isAdmin) {
            setActiveNav('users');
        } else if (currentTab === 'create') {
            setActiveNav('create');
        } else if (currentTab === 'my') {
            setActiveNav('my');
        } else if (currentTab === 'feed') {
            setActiveNav('feed');
        }
    }, [currentTab, isAdmin]);

    // Fungsi ganti tab dan perbarui URL query tanpa refresh
    const handleSelectTab = (nav: 'feed' | 'create' | 'my' | 'ksm' | 'users') => {
        setActiveNav(nav);
        if (typeof window !== 'undefined') {
            const url = nav === 'feed' ? window.location.pathname : `${window.location.pathname}?tab=${nav}`;
            window.history.replaceState(null, '', url);
        }
    };

    // State Manajemen Pengguna & Admin
    const [userSearch, setUserSearch] = useState<string>('');
    const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState<boolean>(false);
    const [newAdminName, setNewAdminName] = useState<string>('');
    const [newAdminNim, setNewAdminNim] = useState<string>('');
    const [newAdminEmail, setNewAdminEmail] = useState<string>('');
    const [newAdminPassword, setNewAdminPassword] = useState<string>('');
    const [newAdminRole, setNewAdminRole] = useState<string>('admin');
    const [isSubmittingAdmin, setIsSubmittingAdmin] = useState<boolean>(false);
    const [adminError, setAdminError] = useState<string | null>(null);
    const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

    const handleUserSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('dashboard'),
            { tab: 'users', search_user: userSearch },
            { preserveState: true, replace: true }
        );
    };

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingAdmin(true);
        setAdminError(null);
        router.post(
            route('admin.users.store'),
            {
                name: newAdminName,
                nim: newAdminNim,
                email: newAdminEmail,
                password: newAdminPassword,
                role: newAdminRole,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateAdminModalOpen(false);
                    setNewAdminName('');
                    setNewAdminNim('');
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                    setNewAdminRole('admin');
                    setIsSubmittingAdmin(false);
                    setAdminSuccess('Akun admin/pengguna baru berhasil dibuat!');
                    setTimeout(() => setAdminSuccess(null), 3500);
                },
                onError: (err) => {
                    setIsSubmittingAdmin(false);
                    setAdminError(Object.values(err)[0] as string);
                },
            }
        );
    };

    const handleUpdateUserRole = (userId: number, targetRole: string) => {
        router.patch(
            route('admin.users.updateRole', userId),
            { role: targetRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdminSuccess('Role pengguna berhasil diperbarui!');
                    setTimeout(() => setAdminSuccess(null), 3500);
                },
                onError: (err) => {
                    alert(Object.values(err)[0] as string);
                },
            }
        );
    };

    const handleDeleteUser = (userId: number, userName: string) => {
        if (confirm(`Yakin ingin menghapus akun ${userName}?`)) {
            router.delete(route('admin.users.destroy', userId), {
                preserveScroll: true,
                onSuccess: () => {
                    setAdminSuccess(`Akun ${userName} berhasil dihapus.`);
                    setTimeout(() => setAdminSuccess(null), 3500);
                },
                onError: (err) => {
                    alert(Object.values(err)[0] as string);
                },
            });
        }
    };

    // Data State Aspirasi Tersinkronisasi
    const [aspirations, setAspirations] = useState<AspirationItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const [sortBy, setSortBy] = useState<'trending' | 'terbaru'>('trending');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Listener klik di luar untuk menutup dropdown kategori
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target as Node)
            ) {
                setIsCategoryOpen(false);
            }
        };

        if (isCategoryOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCategoryOpen]);

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

    // Load & Subscribe Sinkronisasi Data Dua Arah dari Server
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

    // Toggle Upvote Tersinkron
    const handleToggleVote = async (id: number) => {
        const updated = await toggleVoteSharedAspiration(id);
        setAspirations(updated);
    };

    // Hapus Aspirasi (Admin atau Pembuat)
    const handleDeleteAspiration = async (id: number, title: string) => {
        if (!confirm(`Hapus aspirasi "${title}"?`)) return;
        await deleteSharedAspiration(id);
        setAspirations(getSharedAspirations());
    };

    // Hapus Komentar (Admin atau Pembuat)
    const handleDeleteComment = async (commentId: number, aspirationId: number) => {
        if (!confirm('Hapus komentar ini?')) return;
        await deleteSharedComment(commentId, aspirationId);
        setAspirations(getSharedAspirations());
    };

    // Toggle Buka/Tutup Komentar Tanggapan
    const toggleComments = (aspirationId: number) => {
        setOpenCommentId(openCommentId === aspirationId ? null : aspirationId);
    };

    // Kirim Tanggapan Baru Tersinkron
    const handleAddComment = async (aspirationId: number, e: React.FormEvent) => {
        e.preventDefault();
        const text = (commentInputs[aspirationId] || '').trim();
        if (!text) return;

        const updated = await addCommentSharedAspiration(aspirationId, {
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
        handleSelectTab('feed');

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

    // Statistik Ringkasan untuk Kolom Informasi Kanan
    const statsOverview = useMemo(() => {
        const total = aspirations.length;
        const totalVotes = aspirations.reduce((acc, curr) => acc + curr.votes, 0);
        const totalComments = aspirations.reduce((acc, curr) => acc + curr.comments.length, 0);

        const catCounts: Record<string, number> = {};
        aspirations.forEach((item) => {
            catCounts[item.category] = (catCounts[item.category] || 0) + 1;
        });

        let topCategory = '-';
        let maxCount = 0;
        Object.entries(catCounts).forEach(([cat, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
            }
        });

        return { total, totalVotes, totalComments, topCategory };
    }, [aspirations]);

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
            onSelectNav={(nav) => handleSelectTab(nav as 'feed' | 'create' | 'my' | 'ksm' | 'users')}
            header={
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-sm sm:text-lg lg:text-xl font-black text-hima-blue-dark uppercase tracking-tight truncate">
                                {activeNav === 'create'
                                    ? 'Tulis Aspirasi Mahasiswa'
                                    : activeNav === 'my'
                                    ? 'Aspirasi Saya'
                                    : activeNav === 'ksm'
                                    ? 'Rekapitulasi Data Survei KSM'
                                    : activeNav === 'users'
                                    ? 'Manajemen Pengguna & Admin'
                                    : 'Forum Aspirasi Mahasiswa'}
                            </h1>
                            {isSuperAdmin ? (
                                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-300 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-red-700 tracking-wide uppercase shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                    SUPER ADMIN
                                </span>
                            ) : isAdmin ? (
                                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-300 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-blue-700 tracking-wide uppercase shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    ADMIN HIMA
                                </span>
                            ) : null}
                        </div>
                        <p className="hidden md:block text-xs text-slate-500 font-medium mt-0.5 truncate">
                            {activeNav === 'create'
                                ? 'Sampaikan ide, masukan fasilitas, atau kendala perkuliahan secara langsung.'
                                : activeNav === 'my'
                                ? 'Daftar seluruh aspirasi yang pernah kamu sampaikan ke forum mahasiswa.'
                                : activeNav === 'ksm'
                                ? 'Data survei peminatan teknologi, kebutuhan materi, dan jadwal belajar mahasiswa HIMA IF.'
                                : activeNav === 'users'
                                ? 'Daftar pengguna terdaftar dan pembuatan akun admin pengurus HIMA IF.'
                                : 'Suarakan masukan dan dukung aspirasi rekan mahasiswa Teknik Informatika.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {activeNav === 'users' ? (
                            <button
                                type="button"
                                onClick={() => setIsCreateAdminModalOpen(true)}
                                className="inline-flex btn-brutal items-center gap-1 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-brutal-xs hover:bg-hima-red-light transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>+ Admin Baru</span>
                            </button>
                        ) : activeNav === 'ksm' ? (
                            <a
                                href={route('admin.ksm.export')}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export .xls</span>
                            </a>
                        ) : activeNav !== 'create' ? (
                            <button
                                type="button"
                                onClick={() => handleSelectTab('create')}
                                className="hidden sm:inline-flex btn-brutal items-center gap-1.5 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Tulis Aspirasi</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSelectTab('feed')}
                                className="inline-flex items-center gap-1.5 border-2 border-slate-300 bg-white text-slate-700 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase hover:bg-slate-50 transition-colors shadow-xs"
                            >
                                ← Kembali
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Portal Aspirasi Mahasiswa HIMA IF" />

            <div className="w-full space-y-8 sm:space-y-12">
                {/* Notifikasi Sukses Sederhana */}


                {/* Notifikasi Sukses Sederhana */}
                {showSuccessAlert && (
                    <div className="w-full bg-emerald-50 border-2 border-emerald-600 p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 font-semibold anim-feed-item">
                        <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                                ✓
                            </span>
                            <span>Aspirasi Anda berhasil dikirim ke forum mahasiswa!</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowSuccessAlert(false)}
                            className="text-emerald-800 font-bold hover:text-black p-1"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 1. TAMPILAN REKAP DATA KSM (KHUSUS ADMIN)                                 */}
                {/* ========================================================================= */}
                {activeNav === 'ksm' && isAdmin && ksmData ? (
                    <div className="w-full space-y-8 sm:space-y-10">
                        {/* Metrik Statistik Flat Minimalis */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white border-2 border-slate-200 p-4 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Total Responden
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                                        {ksmData.stats.total}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">Mahasiswa</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-200 p-4 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Rata-rata Minat
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                                        {ksmData.stats.avgInterest}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">/ 4.0 Skala</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-200 p-4 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Top Bidang Teknologi
                                </span>
                                <span className="text-sm font-bold text-slate-900 block truncate" title={ksmData.stats.topField}>
                                    {ksmData.stats.topField}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-600 block">
                                    Paling Banyak Dipilih
                                </span>
                            </div>

                            <div className="bg-white border-2 border-slate-200 p-4 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Jadwal Terfavorit
                                </span>
                                <span className="text-sm font-bold text-slate-900 block truncate">
                                    {ksmData.stats.topDay} ({ksmData.stats.topTime})
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 block">
                                    Pilihan Terbanyak
                                </span>
                            </div>
                        </div>

                        {/* Distribusi Singkat Flat */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Distribusi Bidang */}
                            <div className="bg-white border-2 border-slate-200 p-4 sm:p-5 space-y-3">
                                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800">
                                        Peminatan Bidang Teknologi
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-400">Maks. 3 Pilihan</span>
                                </div>
                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
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
                                                    <div className="w-full bg-slate-100 h-2 overflow-hidden">
                                                        <div
                                                            className="bg-hima-blue-dark h-full transition-all"
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
                            <div className="bg-white border-2 border-slate-200 p-4 sm:p-5 space-y-3">
                                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800">
                                        Bentuk Kegiatan Pilihan
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-400">Maks. 2 Pilihan</span>
                                </div>
                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                    {Object.entries(ksmData.stats.activityDistribution).map(([act, count]) => {
                                        const pct = ksmData.stats.total > 0 ? Math.round((count / ksmData.stats.total) * 100) : 0;
                                        return (
                                            <div key={act} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                    <span>{act}</span>
                                                    <span className="font-mono text-slate-500">{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 overflow-hidden">
                                                    <div
                                                        className="bg-red-600 h-full transition-all"
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
                        <div className="bg-white border-2 border-slate-200 p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                        Daftar Responden Survei ({ksmData.surveys.total})
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Respon kuesioner mahasiswa HIMA IF untuk perencanaan program KSM.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                                    <a
                                        href={route('admin.ksm.export')}
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Export .xls</span>
                                    </a>

                                    <form onSubmit={handleKsmSearch} className="flex gap-1 flex-1 sm:w-72">
                                        <input
                                            type="text"
                                            value={ksmSearch}
                                            onChange={(e) => setKsmSearch(e.target.value)}
                                            placeholder="Cari nama, NIM, kelas..."
                                            className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800"
                                        />
                                        <button
                                            type="submit"
                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase transition-colors shrink-0"
                                        >
                                            Cari
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Tampilan Mobile: Kartu Responden Bersih & Lega */}
                            <div className="space-y-3 sm:hidden">
                                {ksmData.surveys.data.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 italic bg-slate-50 border border-slate-200">
                                        Belum ada data responden yang sesuai.
                                    </div>
                                ) : (
                                    ksmData.surveys.data.map((item, idx) => (
                                        <div key={item.id} className="border-2 border-slate-200 p-3.5 space-y-2.5 bg-white shadow-xs">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                                                            #{(ksmData.surveys.current_page - 1) * 15 + idx + 1}
                                                        </span>
                                                        <span className="font-bold text-slate-900 text-xs">
                                                            {item.respondent_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-mono block">
                                                        {item.respondent_nim || 'Tanpa NIM'}
                                                    </span>
                                                </div>
                                                <span className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                                                    Kelas {item.respondent_class || '-'}
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-100">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Matkul Smt 3:</span>
                                                    <span className="font-medium text-slate-800 text-right">{item.semester_course}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Minat Belajar:</span>
                                                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.2">
                                                        Skala {item.interest_scale}/5
                                                    </span>
                                                </div>
                                            </div>

                                            {item.interested_fields && item.interested_fields.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {item.interested_fields.map((f) => (
                                                        <span
                                                            key={f}
                                                            className="bg-blue-50 text-hima-blue-dark border border-blue-100 text-[9px] font-medium px-1.5 py-0.2"
                                                        >
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                                <span className="text-[10px] text-slate-400">
                                                    {item.preferred_days?.join(', ') || '-'} • {item.preferred_time}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSurvey(item)}
                                                    className="border border-slate-300 bg-white text-slate-800 hover:bg-slate-900 hover:text-white px-3 py-1 text-[11px] font-bold uppercase transition-colors shadow-xs"
                                                >
                                                    Detail →
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Tampilan Desktop: Tabel 8 Kolom Lengkap */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="p-3">No</th>
                                            <th className="p-3">Responden</th>
                                            <th className="p-3">Kelas</th>
                                            <th className="p-3">Matkul Smt 3</th>
                                            <th className="p-3">Bidang Minat</th>
                                            <th className="p-3">Jadwal</th>
                                            <th className="p-3">Minat</th>
                                            <th className="p-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {ksmData.surveys.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                                                    Belum ada data responden yang sesuai.
                                                </td>
                                            </tr>
                                        ) : (
                                            ksmData.surveys.data.map((item, idx) => (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-3 font-mono text-slate-400">
                                                        {(ksmData.surveys.current_page - 1) * 15 + idx + 1}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-bold text-slate-900 block">
                                                            {item.respondent_name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {item.respondent_nim || 'Tanpa NIM'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="inline-block bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                                            {item.respondent_class || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-medium text-slate-800">
                                                        {item.semester_course}
                                                    </td>
                                                    <td className="p-3">
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
                                                    <td className="p-3 text-[11px]">
                                                        <span className="block font-medium text-slate-800">
                                                            {item.preferred_days?.join(', ') || '-'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.preferred_time}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="inline-block bg-slate-100 text-slate-800 font-bold font-mono text-[10px] px-1.5 py-0.5 border border-slate-200">
                                                            Skala {item.interest_scale}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedSurvey(item)}
                                                                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-900 hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                                                            >
                                                                Detail
                                                            </button>
                                                            {isAdmin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (confirm(`Yakin ingin menghapus data survei dari ${item.respondent_name}?`)) {
                                                                            router.delete(route('admin.ksm.destroy', item.id), {
                                                                                preserveScroll: true,
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-2 py-1 text-[11px] font-bold uppercase transition-colors"
                                                                    title="Hapus Data Survei"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Links */}
                            {ksmData.surveys.links && ksmData.surveys.links.length > 3 && (
                                <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
                                    {ksmData.surveys.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 text-xs border font-medium transition-all ${
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
                                <div className="bg-white border border-slate-300 w-full max-w-lg p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div>
                                            <h4 className="font-bold text-base text-slate-900 tracking-tight">
                                                Detail Responden KSM
                                            </h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">
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

                                    <div className="space-y-3.5 text-xs">
                                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3">
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                                    Kelas Mahasiswa:
                                                </span>
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {selectedSurvey.respondent_class || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                                    NIM Responden:
                                                </span>
                                                <span className="font-bold text-slate-900 font-mono text-xs">
                                                    {selectedSurvey.respondent_nim || '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-0.5">
                                                Materi Matkul Smt 3:
                                            </span>
                                            <span className="font-bold text-slate-900 text-sm">
                                                {selectedSurvey.semester_course}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
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
                                            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
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
                                            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-0.5">
                                                Metode Belajar:
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {selectedSurvey.learning_method}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3">
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                                    Jadwal Pilihan:
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    {selectedSurvey.preferred_days?.join(', ')} ({selectedSurvey.preferred_time})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                                    Skala Minat:
                                                </span>
                                                <span className="font-bold text-hima-blue-dark font-mono">
                                                    Skala {selectedSurvey.interest_scale} / 4
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
                                                Saran / Usulan:
                                            </span>
                                            <div className="p-3 bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed italic">
                                                {selectedSurvey.feedback || 'Tidak ada catatan tambahan.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSurvey(null)}
                                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-bold uppercase transition-colors"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeNav === 'users' && isAdmin && usersData ? (
                    /* ========================================================================= */
                    /* 1.5 PANEL KELOLA PENGGUNA & ADMIN HIMA                                    */
                    /* ========================================================================= */
                    <div className="space-y-8 sm:space-y-10">
                        {adminSuccess && (
                            <div className="bg-emerald-600 text-white px-4 py-3 text-xs font-bold border-2 border-slate-900 shadow-brutal-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{adminSuccess}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAdminSuccess(null)}
                                    className="font-mono font-black text-white hover:opacity-80 text-sm px-1"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Statistik Ringkas Pengguna */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-xs flex flex-col justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Total Pengguna
                                </span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl sm:text-3xl font-black text-hima-blue-dark">
                                        {usersData.stats.total}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Akun</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-xs flex flex-col justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                                    Super Admin
                                </span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl sm:text-3xl font-black text-red-600">
                                        {usersData.stats.super_admin}
                                    </span>
                                    <span className="text-[10px] font-bold text-red-400 uppercase">Akses Penuh</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-xs flex flex-col justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-hima-blue-light">
                                    Admin HIMA
                                </span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl sm:text-3xl font-black text-hima-blue-dark">
                                        {usersData.stats.admin}
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">Pengurus</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-xs flex flex-col justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Mahasiswa
                                </span>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-2xl sm:text-3xl font-black text-slate-700">
                                        {usersData.stats.mahasiswa}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mahasiswa</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Data & Pencarian */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-brutal-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-sm font-black text-hima-blue-dark uppercase tracking-tight">
                                        Daftar Akun Terdaftar
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kelola hak akses pengurus HIMA dan data akun mahasiswa Teknik Informatika.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateAdminModalOpen(true)}
                                        className="inline-flex btn-brutal items-center gap-1 border-2 border-hima-blue-dark bg-hima-red-dark text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-brutal-xs hover:bg-hima-red-light transition-all shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>+ Admin Baru</span>
                                    </button>

                                    <form onSubmit={handleUserSearch} className="flex items-center gap-1.5 w-full sm:w-auto">
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Cari nama, NIM, email..."
                                            className="px-3 py-1.5 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden w-full sm:w-64"
                                        />
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-slate-800 transition-colors shrink-0"
                                        >
                                            Cari
                                        </button>
                                        {userSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUserSearch('');
                                                    router.get(route('dashboard'), { tab: 'users' }, { preserveState: true, replace: true });
                                                }}
                                                className="px-2.5 py-1.5 border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-bold shrink-0"
                                                title="Reset pencarian"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </form>

                                    <button
                                        type="button"
                                        onClick={() => setIsCreateAdminModalOpen(true)}
                                        className="sm:hidden px-3 py-1.5 bg-hima-red-dark text-white font-black text-xs uppercase shrink-0"
                                    >
                                        + Admin
                                    </button>
                                </div>
                            </div>

                            {/* Tampilan Mobile: Kartu Pengguna */}
                            <div className="block sm:hidden space-y-3">
                                {usersData.users.data.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">
                                        Tidak ada akun pengguna yang ditemukan.
                                    </div>
                                ) : (
                                    usersData.users.data.map((item) => (
                                        <div key={item.id} className="border-2 border-slate-200 p-3 space-y-2 bg-slate-50/50">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-black text-xs text-slate-900 block">{item.name}</span>
                                                    <span className="font-mono text-[11px] text-slate-500">{item.nim || '-'}</span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                                        item.role === 'super_admin' || item.role === 'superadmin'
                                                            ? 'bg-red-600 text-white'
                                                            : item.role === 'admin'
                                                            ? 'bg-hima-blue-dark text-white'
                                                            : 'bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    {item.role === 'super_admin' || item.role === 'superadmin'
                                                        ? 'Super Admin'
                                                        : item.role === 'admin'
                                                        ? 'Admin HIMA'
                                                        : 'Mahasiswa'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-600 break-all">{item.email}</div>
                                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500">Role:</label>
                                                    <select
                                                        value={item.role || 'mahasiswa'}
                                                        disabled={item.id === user.id || (!isSuperAdmin && item.role === 'super_admin')}
                                                        onChange={(e) => handleUpdateUserRole(item.id, e.target.value)}
                                                        className="text-[11px] font-semibold border border-slate-300 py-0.5 px-2 bg-white disabled:opacity-50"
                                                    >
                                                        <option value="mahasiswa">Mahasiswa</option>
                                                        <option value="admin">Admin HIMA</option>
                                                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                                    </select>
                                                </div>
                                                {item.id !== user.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteUser(item.id, item.name)}
                                                        className="text-red-600 hover:text-red-800 text-[11px] font-black uppercase underline"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Tampilan Desktop: Tabel Lengkap */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="p-3">No</th>
                                            <th className="p-3">Nama & NIM</th>
                                            <th className="p-3">Email Kampus</th>
                                            <th className="p-3">Role Saat Ini</th>
                                            <th className="p-3">Bergabung</th>
                                            <th className="p-3 text-right">Aksi & Ubah Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {usersData.users.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                                    Tidak ada data akun yang sesuai pencarian.
                                                </td>
                                            </tr>
                                        ) : (
                                            usersData.users.data.map((item, idx) => (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-3 font-mono text-slate-400">
                                                        {(usersData.users.current_page - 1) * 15 + idx + 1}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-slate-900">{item.name}</div>
                                                        <div className="font-mono text-[11px] text-slate-500">{item.nim || '-'}</div>
                                                    </td>
                                                    <td className="p-3 font-mono text-[11px] text-slate-600">
                                                        {item.email}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                                                item.role === 'super_admin' || item.role === 'superadmin'
                                                                    ? 'bg-red-600 text-white'
                                                                    : item.role === 'admin'
                                                                    ? 'bg-hima-blue-dark text-white'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                            }`}
                                                        >
                                                            {item.role === 'super_admin' || item.role === 'superadmin'
                                                                ? 'Super Admin'
                                                                : item.role === 'admin'
                                                                ? 'Admin HIMA'
                                                                : 'Mahasiswa'}
                                                        </span>
                                                        {item.id === user.id && (
                                                            <span className="ml-1.5 text-[10px] text-emerald-600 font-bold">(Akun Kamu)</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <select
                                                                value={item.role || 'mahasiswa'}
                                                                disabled={item.id === user.id || (!isSuperAdmin && (item.role === 'super_admin' || item.role === 'superadmin'))}
                                                                onChange={(e) => handleUpdateUserRole(item.id, e.target.value)}
                                                                className="text-xs font-semibold border border-slate-300 py-1 px-2 bg-white hover:border-slate-400 disabled:opacity-50 disabled:bg-slate-100 cursor-pointer"
                                                            >
                                                                <option value="mahasiswa">Mahasiswa</option>
                                                                <option value="admin">Admin HIMA</option>
                                                                {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                                            </select>

                                                            {item.id !== user.id && (
                                                                <button
                                                                    type="button"
                                                                    disabled={!isSuperAdmin && (item.role === 'super_admin' || item.role === 'superadmin')}
                                                                    onClick={() => handleDeleteUser(item.id, item.name)}
                                                                    className="border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-2 py-1 text-xs font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                                                    title="Hapus Akun"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Links */}
                            {usersData.users.links && usersData.users.links.length > 3 && (
                                <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
                                    {usersData.users.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 text-xs border font-medium transition-all ${
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

                        {/* Modal Pop-up Buat Admin Baru */}
                        {isCreateAdminModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs anim-feed-item">
                                <div className="bg-white border-3 border-hima-blue-dark shadow-brutal-lg max-w-md w-full p-6 space-y-4">
                                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                                        <div>
                                            <h3 className="text-sm font-black text-hima-blue-dark uppercase tracking-tight">
                                                + Buat Akun Pengurus / Admin Baru
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Daftarkan akun pengurus HIMA IF dengan hak akses administratif.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreateAdminModalOpen(false);
                                                setAdminError(null);
                                            }}
                                            className="font-mono font-black text-slate-400 hover:text-slate-900 text-base"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {adminError && (
                                        <div className="bg-red-50 text-red-700 border border-red-200 p-2.5 text-xs font-semibold">
                                            {adminError}
                                        </div>
                                    )}

                                    <form onSubmit={handleCreateAdmin} className="space-y-3.5">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newAdminName}
                                                onChange={(e) => setNewAdminName(e.target.value)}
                                                placeholder="Contoh: Muhammad Farhan"
                                                className="w-full px-3 py-2 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                                                    NIM <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newAdminNim}
                                                    onChange={(e) => setNewAdminNim(e.target.value)}
                                                    placeholder="250414010"
                                                    className="w-full px-3 py-2 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                                                    Role Akses <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={newAdminRole}
                                                    onChange={(e) => setNewAdminRole(e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden font-bold"
                                                >
                                                    <option value="admin">Admin HIMA</option>
                                                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                                                Email Kampus / Akun <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={newAdminEmail}
                                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                                placeholder="admin.himatif@lpkia.ac.id"
                                                className="w-full px-3 py-2 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                                                Password Sementara <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                value={newAdminPassword}
                                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                                placeholder="Minimal 8 karakter"
                                                className="w-full px-3 py-2 border-2 border-slate-300 text-xs focus:border-hima-blue-dark focus:ring-0 outline-hidden"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                Admin baru dapat mengganti password nanti di profil masing-masing.
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCreateAdminModalOpen(false);
                                                    setAdminError(null);
                                                }}
                                                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase hover:bg-slate-100 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingAdmin}
                                                className="px-5 py-2 bg-hima-blue-dark hover:bg-hima-blue-light text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                            >
                                                {isSubmittingAdmin ? 'Menyimpan...' : 'Simpan Akun'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeNav === 'create' ? (
                    /* ========================================================================= */
                    /* 2. FORM TULIS ASPIRASI BARU (TERPUSAT, LEGA, RAPI)                        */
                    /* ========================================================================= */
                    <div className="scroll-reveal max-w-3xl mx-auto w-full bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="border-b-2 border-slate-100 pb-4">
                            <h2 className="text-base sm:text-lg font-black text-hima-blue-dark uppercase tracking-tight">
                                Formulir Penyampaian Aspirasi
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Tuliskan aspirasi, ide pengembangan, atau kendala fasilitas kamu secara jelas agar mudah didiskusikan oleh mahasiswa lain.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAspiration} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1.5">
                                    Judul Aspirasi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Contoh: Penambahan colokan listrik dan Wi-Fi di selasar Lab Komputer"
                                    className="w-full border-2 border-slate-300 bg-white p-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-hima-blue-dark transition-colors rounded-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1.5">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full border-2 border-slate-300 bg-white p-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-hima-blue-dark transition-colors rounded-none"
                                    >
                                        {APP_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1.5">
                                        Identitas Pengirim
                                    </label>
                                    <div className="border-2 border-slate-300 p-2.5 bg-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800 truncate mr-2">
                                            {formIsAnonymous ? 'Anonim (Privasi Terjaga)' : user.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormIsAnonymous(!formIsAnonymous)}
                                            className={`border px-3 py-1 text-[10px] font-black uppercase transition-colors shrink-0 ${
                                                formIsAnonymous
                                                    ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                                    : 'bg-white text-hima-blue-dark border-hima-blue-dark hover:bg-blue-50'
                                            }`}
                                        >
                                            {formIsAnonymous ? 'Mode: Anonim' : 'Mode: Publik'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-hima-blue-dark mb-1.5">
                                    Isi Aspirasi & Usulan Solusi *
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Jelaskan kendala riil, waktu/tempat kejadian, serta usulan solusi praktis yang kamu harapkan..."
                                    className="w-full border-2 border-slate-300 bg-white p-3 text-xs sm:text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:border-hima-blue-dark transition-colors rounded-none resize-none leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => handleSelectTab('feed')}
                                    className="border-2 border-slate-300 bg-white px-5 py-2.5 text-xs font-bold uppercase text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-7 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm hover:bg-hima-blue-light transition-all"
                                >
                                    Kirim Aspirasi Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* ========================================================================= */
                    /* 3. TAMPILAN FEED ASPIRASI (2 KOLOM PROPORSIONAL, BERNAPAS & TIDAK SEMPIT)   */
                    /* ========================================================================= */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* KOLOM KIRI (70%): SEARCH, FILTER & LIST KARTU ASPIRASI */}
                        <div className="lg:col-span-8 space-y-10 sm:space-y-14">
                            {/* Kotak Filter & Pencarian yang Rapi, Ringkas & Bebas Overflow */}
                            <div className="scroll-reveal w-full bg-white border-2 border-slate-200 p-4 sm:p-6 shadow-xs space-y-3.5 relative z-30">
                                {/* Baris 1: Pencarian Full Width */}
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari aspirasi mahasiswa berdasarkan kata kunci..."
                                        className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 border-2 border-slate-300 focus:outline-none focus:border-hima-blue-dark rounded-none bg-slate-50/50"
                                    />
                                </div>

                                {/* Baris 2: Dropdown Kategori Interaktif & Pilihan Sortir */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                                    {/* Dropdown Kategori Interaktif */}
                                    <div ref={categoryDropdownRef} className="relative flex-1 sm:max-w-xs">
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className={`w-full flex items-center justify-between gap-2 border-2 px-3 py-2 text-xs font-bold transition-all shadow-xs ${
                                                isCategoryOpen
                                                    ? 'border-hima-blue-dark bg-blue-50/40 text-hima-blue-dark'
                                                    : 'border-slate-300 bg-white hover:border-slate-800 text-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate text-left">
                                                <span className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase shrink-0">
                                                    Kategori:
                                                </span>
                                                <span
                                                    className={`truncate font-black ${
                                                        selectedCategory !== 'Semua'
                                                            ? 'text-hima-red-dark'
                                                            : 'text-slate-900'
                                                    }`}
                                                >
                                                    {selectedCategory}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {selectedCategory !== 'Semua' && (
                                                    <span
                                                        role="button"
                                                        title="Reset ke Semua Kategori"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCategory('Semua');
                                                        }}
                                                        className="text-[9px] bg-slate-200 hover:bg-hima-red-dark hover:text-white text-slate-700 px-1 py-0.2 font-black uppercase transition-colors"
                                                    >
                                                        ✕
                                                    </span>
                                                )}
                                                <svg
                                                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                                                        isCategoryOpen ? 'rotate-180 text-hima-blue-dark' : ''
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Menu Popover Dropdown Kategori */}
                                        {isCategoryOpen && (
                                            <div className="absolute left-0 right-0 sm:right-auto sm:w-80 mt-1 bg-white border-2 border-slate-900 shadow-2xl z-50 py-1 anim-fade-in max-h-64 overflow-y-auto">
                                                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    Pilih Kategori Aspirasi
                                                </div>
                                                {APP_CATEGORIES.map((cat) => {
                                                    const isSelected = selectedCategory === cat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCategory(cat);
                                                                setIsCategoryOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                                                                isSelected
                                                                    ? 'bg-hima-red-dark text-white'
                                                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            <span>{cat}</span>
                                                            {isSelected && (
                                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tombol Sortir Top Vote & Terbaru */}
                                    <div className="grid grid-cols-2 sm:flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setSortBy('trending')}
                                            className={`inline-flex items-center justify-center gap-1.5 border-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                                                sortBy === 'trending'
                                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                            </svg>
                                            <span>Top Vote</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSortBy('terbaru')}
                                            className={`border-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-center transition-all ${
                                                sortBy === 'terbaru'
                                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            Terbaru
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Kartu Aspirasi dengan Padding Lega */}
                            {filteredAspirations.length === 0 ? (
                                <div className="w-full bg-white border-2 border-slate-300 p-10 text-center shadow-xs anim-feed-item">
                                    <p className="text-sm sm:text-base font-black uppercase text-hima-blue-dark">
                                        Belum Ada Aspirasi di Kategori Ini
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                        {searchQuery
                                            ? 'Tidak ditemukan aspirasi yang cocok dengan kata kunci pencarian Anda.'
                                            : 'Jadilah mahasiswa pertama yang menyuarakan aspirasi untuk memajukan prodi!'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTab('create')}
                                        className="mt-4 inline-flex items-center gap-2 border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-5 py-2 text-xs font-bold uppercase hover:bg-hima-blue-light transition-colors"
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
                                            className={`scroll-reveal stagger-${(index % 4) + 1} w-full bg-white border-2 border-slate-200 border-l-4 border-l-hima-blue-dark p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all duration-150 space-y-3.5`}
                                        >
                                            {/* Baris Kategori & Waktu */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                                    {item.category}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-400">
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

                                            {/* Judul Aspirasi (Tebal, Jelas, Nyaman Dibaca) */}
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                                                {item.title}
                                            </h3>

                                            {/* Uraian Aspirasi (Ukuran Lega) */}
                                            <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed">
                                                {item.content}
                                            </p>

                                            {/* Footer Kartu Sederhana & Seimbang */}
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                                {/* Info Pengirim */}
                                                <div className="flex items-center gap-2 text-xs text-slate-600 truncate max-w-[55%]">
                                                    <div className="w-7 h-7 bg-hima-blue-dark text-white text-xs font-black flex items-center justify-center shrink-0">
                                                        {item.authorName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                                                            {item.authorName}
                                                        </span>
                                                        {item.authorClass && (
                                                            <span className="text-[10px] font-mono text-slate-400">
                                                                Kelas {item.authorClass}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Tombol Interaksi (Vote & Komentar) */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Tombol Tanggapan */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleComments(item.id)}
                                                        className={`inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 border-2 transition-all active:scale-95 ${
                                                            isCommentsOpen
                                                                ? 'bg-blue-50 text-hima-blue-dark border-hima-blue-dark'
                                                                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all active:scale-95 ${
                                                            item.hasVoted
                                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs anim-vote-pop'
                                                                : 'bg-white text-hima-blue-dark border-hima-blue-dark hover:bg-blue-50 shadow-xs'
                                                        }`}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        <span>{item.votes}</span>
                                                        <span className="text-[10px]">
                                                            {item.hasVoted ? 'Didukung' : 'Vote'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SECTION DISKUSI MAHASISWA */}
                                            {isCommentsOpen && (
                                                <div className="pt-3 border-t-2 border-dashed border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 space-y-3">
                                                    <div className="text-xs font-black uppercase tracking-wider text-hima-blue-dark">
                                                        Diskusi Mahasiswa ({item.comments.length})
                                                    </div>

                                                    <div className="space-y-2">
                                                        {item.comments.length === 0 ? (
                                                             <p className="text-xs text-slate-400 italic py-1">
                                                                Belum ada tanggapan untuk aspirasi ini. Jadilah yang pertama memberikan masukan!
                                                            </p>
                                                        ) : (
                                                            item.comments.map((comment) => (
                                                                <div
                                                                    key={comment.id}
                                                                    className={`p-3 border text-xs leading-relaxed ${
                                                                        comment.isOfficial
                                                                            ? 'bg-blue-50/80 border-hima-blue-dark shadow-xs'
                                                                            : 'bg-white border-slate-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="font-bold text-slate-900">
                                                                                {comment.authorName}
                                                                            </span>
                                                                            {comment.isOfficial && (
                                                                                <span className="text-[8px] font-black uppercase bg-hima-blue-dark text-white px-1">
                                                                                    PENGURUS
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-slate-400">
                                                                                {comment.createdAt}
                                                                            </span>
                                                                            {comment.canDelete && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteComment(comment.id, item.id)}
                                                                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase ml-1"
                                                                                    title="Hapus Komentar"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-slate-700">
                                                                        {comment.content}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <form
                                                        onSubmit={(e) => handleAddComment(item.id, e)}
                                                        className="flex gap-2 pt-1"
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
                                                            placeholder="Tulis tanggapan atau solusi kamu..."
                                                            className="flex-1 px-3 py-2 text-xs border border-slate-300 focus:border-hima-blue-dark bg-white focus:outline-none rounded-none shadow-xs"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-4 py-2 text-xs font-bold uppercase hover:bg-hima-blue-light transition-colors shrink-0"
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

                        {/* KOLOM KANAN (30%): WIDGET PENDUKUNG AGAR HALAMAN SEIMBANG & BERNAPAS */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                            {/* Widget 1: Ringkasan Forum Aspirasi */}
                            <div className="scroll-reveal stagger-1 bg-white border-2 border-hima-blue-dark shadow-xs">
                                <div className="bg-hima-blue-dark text-white px-4 py-2.5 flex items-center justify-between">
                                    <h4 className="font-black text-xs uppercase tracking-wider">
                                        Ringkasan Aspirasi
                                    </h4>
                                    <span className="text-[10px] font-mono bg-blue-900/60 px-1.5 py-0.5">
                                        PRODI IF
                                    </span>
                                </div>
                                <div className="p-4 space-y-3.5">
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-slate-50 border border-slate-200 p-2.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                                Total Suara
                                            </span>
                                            <span className="text-xl font-black text-slate-900 font-mono">
                                                {statsOverview.total}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 p-2.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                                Total Dukungan
                                            </span>
                                            <span className="text-xl font-black text-hima-blue-dark font-mono">
                                                {statsOverview.totalVotes}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs space-y-1 bg-slate-50 border border-slate-200 p-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">
                                            Kategori Paling Aktif:
                                        </span>
                                        <span className="font-bold text-slate-900 block truncate">
                                            {statsOverview.topCategory}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectTab('create')}
                                        className="w-full btn-brutal border-2 border-hima-red-dark bg-hima-red-dark text-white py-2 px-3 text-xs font-black uppercase tracking-wider hover:bg-hima-red-light transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Tulis Aspirasi Baru</span>
                                    </button>
                                </div>
                            </div>

                            {/* Widget 2: Alur Suara Mahasiswa */}
                            <div className="scroll-reveal stagger-2 bg-white border-2 border-slate-200 p-4 space-y-3 shadow-xs">
                                <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                                    Alur Tindak Lanjut Aspirasi
                                </h4>
                                <div className="space-y-3 text-xs">
                                    <div className="flex gap-2.5">
                                        <span className="w-5 h-5 bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                            1
                                        </span>
                                        <p className="text-slate-600 leading-snug">
                                            Mahasiswa mengirimkan aspirasi terkait fasilitas, akademik, atau proker.
                                        </p>
                                    </div>
                                    <div className="flex gap-2.5">
                                        <span className="w-5 h-5 bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                            2
                                        </span>
                                        <p className="text-slate-600 leading-snug">
                                            Rekan mahasiswa lain memberikan suara upvote dan tanggapan konstruktif.
                                        </p>
                                    </div>
                                    <div className="flex gap-2.5">
                                        <span className="w-5 h-5 bg-hima-red-dark text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                            3
                                        </span>
                                        <p className="text-slate-600 leading-snug">
                                            Departemen Advokasi HIMA IF membawa aspirasi prioritas ke pimpinan prodi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Widget 3: Tautan Layanan HIMA */}
                            <div className="scroll-reveal stagger-3 bg-white border-2 border-slate-200 p-4 space-y-2.5 shadow-xs">
                                <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                                    Layanan Mahasiswa
                                </h4>
                                <div className="space-y-1.5 text-xs">
                                    <Link
                                        href={route('topik.index')}
                                        className="flex items-center justify-between p-2 border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-slate-700"
                                    >
                                        <span>Topik Hangat Publik</span>
                                        <span className="text-amber-600 text-[10px]">Lihat →</span>
                                    </Link>
                                    <Link
                                        href={route('ksm.survey.index')}
                                        className="flex items-center justify-between p-2 border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-slate-700"
                                    >
                                        <span>Kuesioner Survei KSM</span>
                                        <span className="text-red-600 text-[10px]">Isi →</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
