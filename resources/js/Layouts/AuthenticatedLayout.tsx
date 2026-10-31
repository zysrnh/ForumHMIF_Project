import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface AuthenticatedLayoutProps extends PropsWithChildren {
    header?: ReactNode;
    activeNav?: string;
    onSelectNav?: (nav: string) => void;
}

export default function Authenticated({
    header,
    children,
    activeNav,
    onSelectNav,
}: AuthenticatedLayoutProps) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileAccountMenuOpen, setMobileAccountMenuOpen] = useState(false);
    const [showWebmailModal, setShowWebmailModal] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hmif_sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [avatarError, setAvatarError] = useState(false);

    const toggleDesktopSidebar = () => {
        setIsDesktopCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('hmif_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    // Format NIM dari database atau dari format fellow email
    const displayNim =
        user.nim || (user.email.includes('@') ? user.email.split('@')[0] : 'MAHASISWA');

    // Hak akses role
    const isAdmin = ['admin', 'super_admin', 'superadmin'].includes(user.role || '');
    const isSuperAdmin = user.role === 'super_admin';

    // Menentukan nav aktif berdasarkan url jika tidak di-pass manual
    const isProfilePage = route().current('profile.edit');
    const currentNav = isProfilePage ? 'profile' : activeNav || 'feed';

    const handleNavClick = (navId: string) => {
        if (onSelectNav) {
            onSelectNav(navId);
        }
        setSidebarOpen(false);
        setMobileAccountMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-black flex flex-col md:flex-row">
            {/* Mobile Topbar (App-Like Header) */}
            <div className="md:hidden bg-white border-b-2 border-hima-blue-dark px-3 py-2 flex items-center justify-between shadow-brutal-sm sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 border-2 border-hima-blue-dark bg-blue-50 text-hima-blue-dark hover:bg-hima-blue-dark hover:text-white transition-colors"
                        aria-label="Buka Menu Navigasi"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2">
                        <ApplicationLogo className="h-7 w-auto" />
                        <div>
                            <span className="font-black text-hima-blue-dark text-[11px] tracking-tight block leading-tight">
                                HIMA IF
                            </span>
                            <span className="text-[8px] font-bold text-hima-red-dark uppercase tracking-wider block">
                                LPKIA
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-1.5">
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setShowWebmailModal(true)}
                            className="text-[10px] font-bold text-hima-red-dark bg-red-50 border border-hima-red-dark px-2 py-1 uppercase tracking-wider hover:bg-hima-red-dark hover:text-white transition-colors flex items-center gap-1"
                            title="Buka Webmail Resmi HMIF"
                        >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Webmail</span>
                        </button>
                    )}
                    <Link
                        href="/"
                        className="text-[10px] font-bold text-hima-blue-dark bg-blue-50 border border-hima-blue-dark px-2 py-1 uppercase tracking-wider hover:bg-hima-blue-dark hover:text-white transition-colors flex items-center gap-1 shadow-xs shrink-0"
                        title="Kembali ke Halaman Utama"
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Beranda</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop Fixed & Mobile Slide-in Drawer) */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r-2 border-hima-blue-dark z-50 flex flex-col justify-between transition-all duration-200 ease-in-out shadow-brutal md:shadow-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } ${
                    isDesktopCollapsed ? 'w-64 md:w-16 lg:w-16' : 'w-64 lg:w-72'
                }`}
            >
                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
                    {/* Brand Header */}
                    <div className={`border-b-2 border-hima-blue-dark bg-white flex items-center transition-all ${
                        isDesktopCollapsed ? 'p-3 md:p-2.5 md:justify-center' : 'p-4 sm:p-5 justify-between'
                    }`}>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3"
                            title="HIMA INFORMATIKA - IDE LPKIA"
                        >
                            <ApplicationLogo className={`object-contain shrink-0 transition-all ${
                                isDesktopCollapsed ? 'h-9 w-auto md:h-9' : 'h-11 sm:h-12 w-auto'
                            }`} />
                            <div className={isDesktopCollapsed ? 'md:hidden' : 'block'}>
                                <h2 className="font-black text-sm sm:text-base text-hima-blue-dark tracking-tight leading-none whitespace-nowrap">
                                    HIMA INFORMATIKA
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-hima-red-dark mt-0.5 whitespace-nowrap">
                                    IDE LPKIA
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-gray-700 hover:text-black p-1 border border-gray-300"
                            aria-label="Tutup menu mobile"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Info Card Neo-Brutalist */}
                    <div className={`border-b-2 border-hima-blue-dark bg-blue-50/40 transition-all ${
                        isDesktopCollapsed ? 'p-2 md:p-2 md:flex md:justify-center' : 'p-3'
                    }`}>
                        <div
                            className={`bg-white border-2 border-hima-blue-dark shadow-brutal-xs flex items-center transition-all ${
                                isDesktopCollapsed ? 'p-1 md:p-1 md:justify-center' : 'p-2.5 gap-2.5'
                            }`}
                            title={`${user.name} (${displayNim}) - ${user.role === 'super_admin' ? 'SUPER ADMIN' : isAdmin ? 'ADMIN HIMA' : 'MAHASISWA'}`}
                        >
                            {user.avatar && !avatarError ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    onError={() => setAvatarError(true)}
                                    className="w-10 h-10 border-2 border-hima-blue-dark object-cover shrink-0 bg-white shadow-xs"
                                />
                            ) : (
                                <div className="w-10 h-10 border-2 border-hima-blue-dark bg-hima-blue-dark text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={`min-w-0 flex-1 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>
                                <p className="text-xs font-black text-hima-blue-dark uppercase truncate" title={user.name}>
                                    {user.name}
                                </p>
                                <p className="text-[10px] font-mono font-bold text-slate-600 truncate mt-0.5">
                                    NIM: {displayNim}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-hima-blue-dark bg-blue-50 text-hima-blue-dark">
                                        {user.role === 'super_admin' ? 'SUPER ADMIN' : isAdmin ? 'ADMIN HIMA' : 'MAHASISWA'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu Desktop & Drawer */}
                    <nav className={`space-y-1 flex-1 overflow-y-auto text-xs transition-all ${
                        isDesktopCollapsed ? 'p-2 md:px-1.5 md:py-2' : 'p-3'
                    }`}>
                        {/* 0. Halaman Utama Portal */}
                        <Link
                            href="/"
                            title="Kembali ke Halaman Utama"
                            className={`w-full flex items-center font-bold border border-slate-200 text-hima-blue-dark bg-blue-50/50 hover:bg-hima-blue-dark hover:text-white transition-all group ${
                                isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                            }`}
                        >
                            <svg className="w-4 h-4 shrink-0 text-hima-blue-dark group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Halaman Utama</span>
                        </Link>

                        {/* 1. Semua Aspirasi */}
                        {isProfilePage ? (
                            <Link
                                href="/dashboard?tab=feed"
                                title="Semua Aspirasi"
                                className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Semua Aspirasi</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleNavClick('feed')}
                                title="Semua Aspirasi"
                                className={`w-full text-left flex items-center font-bold border transition-all ${
                                    currentNav === 'feed'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                } ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Semua Aspirasi</span>
                            </button>
                        )}

                        {/* 2. Tulis Aspirasi */}
                        {isProfilePage ? (
                            <Link
                                href="/dashboard?tab=create"
                                title="Tulis Aspirasi"
                                className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Tulis Aspirasi</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleNavClick('create')}
                                title="Tulis Aspirasi"
                                className={`w-full text-left flex items-center font-bold border transition-all ${
                                    currentNav === 'create'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                } ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Tulis Aspirasi</span>
                            </button>
                        )}

                        {/* 3. Aspirasi Saya */}
                        {isProfilePage ? (
                            <Link
                                href="/dashboard?tab=my"
                                title="Aspirasi Saya"
                                className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Aspirasi Saya</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleNavClick('my')}
                                title="Aspirasi Saya"
                                className={`w-full text-left flex items-center font-bold border transition-all ${
                                    currentNav === 'my'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                } ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Aspirasi Saya</span>
                            </button>
                        )}

                        {/* 4. Rekap Data KSM (HANYA MUNCUL JIKA USER ADMIN/SUPER ADMIN) */}
                        {isAdmin && (
                            isProfilePage ? (
                                <Link
                                    href="/dashboard?tab=ksm"
                                    title="Rekap Data KSM"
                                    className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                        isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Rekap Data KSM</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 bg-blue-50 text-hima-blue-dark border border-blue-200 ${isDesktopCollapsed ? 'md:hidden' : 'inline'}`}>
                                        ADMIN
                                    </span>
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleNavClick('ksm')}
                                    title="Rekap Data KSM"
                                    className={`w-full text-left flex items-center font-bold border transition-all ${
                                        currentNav === 'ksm'
                                            ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    } ${
                                        isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Rekap Data KSM</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 ${isDesktopCollapsed ? 'md:hidden' : 'inline'} ${currentNav === 'ksm' ? 'bg-white text-hima-blue-dark' : 'bg-blue-50 text-hima-blue-dark border border-blue-200'}`}>
                                        ADMIN
                                    </span>
                                </button>
                            )
                        )}

                        {/* 5. Kelola Pengguna (HANYA MUNCUL JIKA USER ADMIN/SUPER ADMIN) */}
                        {isAdmin && (
                            isProfilePage ? (
                                <Link
                                    href="/dashboard?tab=users"
                                    title="Kelola Pengguna"
                                    className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                        isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Kelola Pengguna</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 bg-red-50 text-hima-red-dark border border-red-200 ${isDesktopCollapsed ? 'md:hidden' : 'inline'}`}>
                                        ADMIN
                                    </span>
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleNavClick('users')}
                                    title="Kelola Pengguna"
                                    className={`w-full text-left flex items-center font-bold border transition-all ${
                                        currentNav === 'users'
                                            ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    } ${
                                        isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Kelola Pengguna</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 ${isDesktopCollapsed ? 'md:hidden' : 'inline'} ${currentNav === 'users' ? 'bg-white text-hima-blue-dark' : 'bg-red-50 text-hima-red-dark border border-red-200'}`}>
                                        ADMIN
                                    </span>
                                </button>
                            )
                        )}

                        {/* Webmail HMIF (HANYA MUNCUL JIKA USER ADMIN/SUPER ADMIN) */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowWebmailModal(true)}
                                title="Buka Webmail Resmi HMIF (Roundcube)"
                                className={`w-full text-left flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-900 hover:text-white transition-all group ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 shrink-0 text-hima-red-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Webmail HMIF</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-1 py-0.2 bg-blue-50 text-hima-blue-dark border border-blue-200 group-hover:bg-white group-hover:text-slate-900 ${isDesktopCollapsed ? 'md:hidden' : 'inline'}`}>
                                    ↗
                                </span>
                            </button>
                        )}

                        {/* 5. Isi Survei KSM (UNTUK MAHASISWA) */}
                        {!isAdmin && (
                            <Link
                                href={route('ksm.survey.index')}
                                title="Isi Survei KSM"
                                className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                    isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Isi Survei KSM</span>
                            </Link>
                        )}

                        {/* 6. Topik */}
                        <Link
                            href={route('topik.index')}
                            title="Topik Diskusi"
                            className={`w-full flex items-center font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                                isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                            }`}
                        >
                            <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                            <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Topik</span>
                        </Link>

                        {/* 7. Akun Profil */}
                        <Link
                            href={route('profile.edit')}
                            title="Akun Pengguna"
                            className={`w-full flex items-center font-bold border transition-all ${
                                isProfilePage
                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                            } ${
                                isDesktopCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 gap-2.5' : 'px-3 py-2 gap-2.5'
                            }`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Akun Pengguna</span>
                        </Link>
                    </nav>

                    {/* Bottom Logout Button */}
                    <div className={`border-t border-slate-200 bg-white transition-all ${
                        isDesktopCollapsed ? 'p-2 md:p-1.5' : 'p-3'
                    }`}>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Keluar dari Akun"
                            className={`w-full flex items-center justify-center border border-red-200 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all ${
                                isDesktopCollapsed ? 'py-2 px-1 md:gap-0' : 'py-2 px-3 gap-2'
                            }`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className={isDesktopCollapsed ? 'md:hidden' : 'inline'}>Keluar</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {header ? (
                    <header className="hidden md:flex bg-white border-b-2 border-hima-blue-dark px-3 py-2.5 sm:px-6 sm:py-3 shadow-brutal-sm items-center gap-3">
                        <button
                            onClick={toggleDesktopSidebar}
                            type="button"
                            aria-label={isDesktopCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                            title={isDesktopCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                            className="hidden md:inline-flex items-center justify-center p-2 border-2 border-hima-blue-dark bg-white shadow-brutal-xs hover:bg-blue-50 active:translate-x-0.5 active:translate-y-0.5 transition-all text-hima-blue-dark shrink-0"
                        >
                            {isDesktopCollapsed ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            )}
                        </button>
                        <div className="flex-1 min-w-0">
                            {header}
                        </div>
                        <Link
                            href="/"
                            className="hidden lg:inline-flex items-center gap-1.5 border-2 border-hima-blue-dark bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-hima-blue-dark hover:bg-hima-blue-dark hover:text-white transition-all shadow-brutal-xs shrink-0"
                            title="Kembali ke Halaman Utama Web"
                        >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Beranda</span>
                        </Link>
                    </header>
                ) : (
                    <div className="hidden md:flex items-center px-6 py-2 bg-white border-b-2 border-hima-blue-dark">
                        <button
                            onClick={toggleDesktopSidebar}
                            type="button"
                            aria-label={isDesktopCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                            title={isDesktopCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                            className="inline-flex items-center gap-2 px-2.5 py-1.5 border-2 border-hima-blue-dark bg-white shadow-brutal-xs hover:bg-blue-50 text-xs font-bold text-hima-blue-dark uppercase"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span>{isDesktopCollapsed ? "Buka Menu" : "Tutup Menu"}</span>
                        </button>
                    </div>
                )}

                {/* Padding bottom di mobile (pb-28) agar konten terbaca lega tanpa tertutup toolbar */}
                <main className="flex-1 p-2.5 sm:p-6 pb-28 md:pb-6">
                    {children}
                </main>

                {/* Dashboard Simple Footer */}
                <footer className="border-t border-gray-300 bg-white px-4 py-3 sm:px-6 pb-28 md:pb-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p className="font-medium text-center sm:text-left">
                        HIMA INFORMATIKA • IDE LPKIA
                    </p>
                    <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-hima-blue-dark">
                        <span>Pemberdayaan Suara Mahasiswa</span>
                    </div>
                </footer>
            </div>

            {/* ========================================================================= */}
            {/* MOBILE APP BOTTOM NAVIGATION: LEGA, RESPONSIF & TIDAK TERPOTONG           */}
            {/* ========================================================================= */}
            <nav
                aria-label="Mobile app navigation toolbar"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-hima-blue-dark shadow-[0px_-3px_10px_rgba(26,70,124,0.12)] px-1 pt-1.5 pb-2.5"
            >
                <div className="flex items-center justify-between gap-1 relative">
                    {/* 1. Feed / Semua */}
                    {isProfilePage ? (
                        <Link
                            href={route('dashboard')}
                            className="group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-blue-50/60"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-hima-blue-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <span className="text-[10px] uppercase tracking-tight mt-0.5 text-gray-500 group-hover:text-hima-blue-dark font-bold">
                                Semua
                            </span>
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-hima-blue-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleNavClick('feed')}
                            className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-blue-50/70 ${
                                currentNav === 'feed' ? 'bg-blue-50/40' : ''
                            }`}
                        >
                            <div
                                className={`p-1 border transition-all ${
                                    currentNav === 'feed'
                                        ? 'bg-blue-50 border-hima-blue-dark shadow-[1px_1px_0px_0px_#1A467C]'
                                        : 'border-transparent group-hover:border-hima-blue-dark/50 group-hover:bg-blue-50/50'
                                }`}
                            >
                                <svg
                                    className={`w-5 h-5 transition-colors ${
                                        currentNav === 'feed' ? 'text-hima-blue-dark' : 'text-gray-500 group-hover:text-hima-blue-dark'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <span
                                className={`text-[10px] uppercase tracking-tight mt-0.5 transition-colors ${
                                    currentNav === 'feed'
                                        ? 'text-hima-blue-dark font-black'
                                        : 'text-gray-500 group-hover:text-hima-blue-dark font-bold'
                                }`}
                            >
                                Semua
                            </span>
                            <span
                                className={`absolute bottom-0 left-2 right-2 h-0.5 transition-all ${
                                    currentNav === 'feed'
                                        ? 'bg-hima-blue-dark opacity-100'
                                        : 'bg-hima-blue-dark opacity-0 group-hover:opacity-100'
                                }`}
                            />
                        </button>
                    )}

                    {/* 2. Tulis Aspirasi */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isProfilePage) {
                                window.location.href = '/dashboard';
                            } else {
                                handleNavClick('create');
                            }
                        }}
                        className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-red-50/70 ${
                            currentNav === 'create' ? 'bg-red-50/40' : ''
                        }`}
                    >
                        <div
                            className={`p-1 border transition-all ${
                                currentNav === 'create'
                                    ? 'bg-red-50 border-hima-red-dark shadow-[1px_1px_0px_0px_#CA2C2A]'
                                    : 'border-transparent group-hover:border-hima-red-dark/50 group-hover:bg-red-50/50'
                            }`}
                        >
                            <svg
                                className={`w-5 h-5 transition-colors ${
                                    currentNav === 'create' ? 'text-hima-red-dark' : 'text-gray-500 group-hover:text-hima-red-dark'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <span
                            className={`text-[10px] uppercase tracking-tight mt-0.5 transition-colors ${
                                currentNav === 'create'
                                    ? 'text-hima-red-dark font-black'
                                    : 'text-gray-500 group-hover:text-hima-red-dark font-bold'
                            }`}
                        >
                            Tulis
                        </span>
                        <span
                            className={`absolute bottom-0 left-2 right-2 h-0.5 transition-all ${
                                currentNav === 'create'
                                    ? 'bg-hima-red-dark opacity-100'
                                    : 'bg-hima-red-dark opacity-0 group-hover:opacity-100'
                            }`}
                        />
                    </button>

                    {/* 3. KSM / Rekap KSM */}
                    {isAdmin ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (isProfilePage) {
                                    window.location.href = '/dashboard?tab=ksm';
                                } else {
                                    handleNavClick('ksm');
                                }
                            }}
                            className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-blue-50/70 ${
                                currentNav === 'ksm' ? 'bg-blue-50/40' : ''
                            }`}
                        >
                            <div
                                className={`p-1 border transition-all ${
                                    currentNav === 'ksm'
                                        ? 'bg-blue-50 border-hima-blue-dark shadow-[1px_1px_0px_0px_#1A467C]'
                                        : 'border-transparent group-hover:border-hima-blue-dark/50 group-hover:bg-blue-50/50'
                                }`}
                            >
                                <svg
                                    className={`w-5 h-5 transition-colors ${
                                        currentNav === 'ksm' ? 'text-hima-blue-dark' : 'text-gray-500 group-hover:text-hima-blue-dark'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span
                                className={`text-[10px] uppercase tracking-tight mt-0.5 transition-colors ${
                                    currentNav === 'ksm'
                                        ? 'text-hima-blue-dark font-black'
                                        : 'text-gray-500 group-hover:text-hima-blue-dark font-bold'
                                }`}
                            >
                                Rekap
                            </span>
                            <span
                                className={`absolute bottom-0 left-2 right-2 h-0.5 transition-all ${
                                    currentNav === 'ksm'
                                        ? 'bg-hima-blue-dark opacity-100'
                                        : 'bg-hima-blue-dark opacity-0 group-hover:opacity-100'
                                }`}
                            />
                        </button>
                    ) : (
                        <Link
                            href={route('ksm.survey.index')}
                            className="group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-blue-50/70"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-red-dark/50 group-hover:bg-red-50/50 transition-all relative">
                                <svg
                                    className="w-5 h-5 text-gray-500 group-hover:text-hima-red-dark transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-hima-red-dark" />
                            </div>
                            <span className="text-[10px] uppercase tracking-tight mt-0.5 text-gray-500 group-hover:text-hima-red-dark font-black">
                                KSM
                            </span>
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-hima-red-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    )}

                    {/* 3. Aspirasi Saya */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isProfilePage) {
                                window.location.href = '/dashboard';
                            } else {
                                handleNavClick('my');
                            }
                        }}
                        className={`group relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 hover:bg-blue-50/70 ${
                            currentNav === 'my' ? 'bg-blue-50/40' : ''
                        }`}
                    >
                        <div
                            className={`p-1 border transition-all ${
                                currentNav === 'my'
                                    ? 'bg-blue-50 border-hima-blue-dark shadow-[1px_1px_0px_0px_#1A467C]'
                                    : 'border-transparent group-hover:border-hima-blue-dark/50 group-hover:bg-blue-50/50'
                            }`}
                        >
                            <svg
                                className={`w-5 h-5 transition-colors ${
                                    currentNav === 'my' ? 'text-hima-blue-dark' : 'text-gray-500 group-hover:text-hima-blue-dark'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span
                            className={`text-[10px] uppercase tracking-tight mt-0.5 transition-colors ${
                                currentNav === 'my'
                                    ? 'text-hima-blue-dark font-black'
                                    : 'text-gray-500 group-hover:text-hima-blue-dark font-bold'
                            }`}
                        >
                            Saya
                        </span>
                        <span
                            className={`absolute bottom-0 left-2 right-2 h-0.5 transition-all ${
                                currentNav === 'my'
                                    ? 'bg-hima-blue-dark opacity-100'
                                    : 'bg-hima-blue-dark opacity-0 group-hover:opacity-100'
                            }`}
                        />
                    </button>

                    {/* 5. Akun Saya (dengan Dropup Popover Melayang ke Atas) */}
                    <div className="relative flex-1">
                        {mobileAccountMenuOpen && (
                            <>
                                {/* Backdrop transparan untuk menutup saat klik area luar */}
                                <div
                                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
                                    onClick={() => setMobileAccountMenuOpen(false)}
                                />

                                {/* Floating Dropup Menu melayang tepat di atas tombol Akun */}
                                <div className="fixed bottom-16 right-2 sm:right-4 w-60 bg-white border-2 border-hima-blue-dark shadow-[4px_4px_0px_0px_#1A467C] z-50 overflow-hidden anim-feed-item">
                                    {/* Header Info User */}
                                    <div className="p-3 bg-blue-50/80 border-b-2 border-hima-blue-dark/20">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            {user.avatar && !avatarError ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    onError={() => setAvatarError(true)}
                                                    className="w-10 h-10 border-2 border-hima-blue-dark object-cover shrink-0 bg-white shadow-xs"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 border-2 border-hima-blue-dark bg-hima-blue-dark text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-hima-blue-dark uppercase truncate" title={user.name}>
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-500 font-bold">
                                                    NIM: {displayNim}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-hima-blue-dark text-white">
                                            {user.role === 'super_admin' ? 'SUPER ADMIN' : isAdmin ? 'ADMIN HIMA' : 'MAHASISWA'}
                                        </span>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-1.5 space-y-1">
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setMobileAccountMenuOpen(false)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-hima-blue-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Profil & Akun</span>
                                        </Link>

                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            onClick={() => setMobileAccountMenuOpen(false)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                                        >
                                            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="uppercase tracking-wider">Keluar Akun</span>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setMobileAccountMenuOpen(!mobileAccountMenuOpen)}
                            className={`w-full group relative flex flex-col items-center justify-center py-1.5 transition-all active:scale-95 hover:bg-blue-50/70 ${
                                isProfilePage || mobileAccountMenuOpen ? 'bg-blue-50/40' : ''
                            }`}
                        >
                            <div
                                className={`p-0.5 border transition-all ${
                                    isProfilePage || mobileAccountMenuOpen
                                        ? 'bg-blue-50 border-hima-blue-dark shadow-[1px_1px_0px_0px_#1A467C]'
                                        : 'border-transparent group-hover:border-hima-blue-dark/50 group-hover:bg-blue-50/50'
                                }`}
                            >
                                {user.avatar && !avatarError ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        onError={() => setAvatarError(true)}
                                        className="w-5 h-5 border border-hima-blue-dark object-cover shrink-0 bg-white"
                                    />
                                ) : (
                                    <div className="w-5 h-5 bg-hima-blue-dark text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span
                                className={`text-[10px] uppercase tracking-tight mt-0.5 transition-colors ${
                                    isProfilePage || mobileAccountMenuOpen
                                        ? 'text-hima-blue-dark font-black'
                                        : 'text-gray-500 group-hover:text-hima-blue-dark font-bold'
                                }`}
                            >
                                Akun
                            </span>
                            <span
                                className={`absolute bottom-0 left-2 right-2 h-0.5 transition-all ${
                                    isProfilePage || mobileAccountMenuOpen
                                        ? 'bg-hima-blue-dark opacity-100'
                                        : 'bg-hima-blue-dark opacity-0 group-hover:opacity-100'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Modal Konfirmasi Buka Webmail Resmi HMIF */}
            {showWebmailModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white border-4 border-hima-blue-dark shadow-brutal p-5 sm:p-6 space-y-4 anim-feed-item">
                        <div className="flex items-center gap-2.5 border-b-2 border-hima-blue-dark pb-3">
                            <div className="w-8 h-8 bg-hima-red-dark text-white flex items-center justify-center font-black shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-black text-sm sm:text-base text-hima-blue-dark uppercase tracking-tight">
                                    Buka Webmail Resmi HMIF?
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    Akses Portal Roundcube Pengurus
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                            <p>
                                Anda akan dialihkan ke server webmail resmi HIMA IF pada tab baru:
                            </p>
                            <div className="p-2.5 bg-blue-50 border-2 border-hima-blue-dark font-mono text-[11px] text-hima-blue-dark break-all font-bold">
                                https://kisaki.kawaiihost.net:2096
                            </div>

                            <div className="bg-slate-50 border-2 border-slate-300 p-3 space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Kredensial Login Webmail:
                                </div>
                                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                                    <span className="text-[11px] font-semibold text-slate-600">Email:</span>
                                    <span className="font-mono text-xs font-bold text-slate-900 select-all">info@hmif-lpkia.my.id</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-semibold text-slate-600">Password:</span>
                                    <span className="font-mono text-xs font-bold text-red-700 bg-white border border-red-200 px-2 py-0.5 select-all">
                                        s^2aPA7YsWXsd7n0
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowWebmailModal(false)}
                                className="px-3.5 py-2 border-2 border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.open('https://kisaki.kawaiihost.net:2096', '_blank');
                                    setShowWebmailModal(false);
                                }}
                                className="px-4 py-2 border-2 border-hima-blue-dark bg-hima-blue-dark text-white hover:bg-hima-blue-light text-xs font-black uppercase tracking-wider shadow-brutal-xs transition-all active:translate-x-0.5 active:translate-y-0.5"
                            >
                                Buka Webmail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
