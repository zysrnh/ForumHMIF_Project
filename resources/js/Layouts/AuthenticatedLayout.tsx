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

    // Format NIM dari database atau dari format fellow email
    const displayNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : 'MAHASISWA');

    // Menentukan nav aktif berdasarkan url jika tidak di-pass manual
    const isProfilePage = route().current('profile.edit');
    const currentNav = isProfilePage ? 'profile' : (activeNav || 'feed');

    const handleNavClick = (navId: string) => {
        if (onSelectNav) {
            onSelectNav(navId);
        }
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-black flex flex-col md:flex-row">
            {/* Mobile Topbar */}
            <div className="md:hidden bg-white border-b-2 border-hima-blue-dark px-4 py-3 flex items-center justify-between shadow-brutal-sm sticky top-0 z-40">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <ApplicationLogo className="h-8 w-auto" />
                    <div>
                        <span className="font-black text-hima-blue-dark text-sm tracking-tight block leading-tight">
                            PORTAL ASPIRASI
                        </span>
                        <span className="text-[10px] font-bold text-hima-red-dark uppercase tracking-wider block">
                            HIMA INFORMATIKA
                        </span>
                    </div>
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    type="button"
                    aria-label="Toggle menu navigasi"
                    className="p-2 border-2 border-hima-blue-dark bg-white shadow-brutal-sm hover:bg-blue-50 active:translate-x-0.5 active:translate-y-0.5"
                >
                    <svg className="w-5 h-5 text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sidebarOpen ? (
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop Fixed & Mobile Slide-in) */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-white border-r-2 border-hima-blue-dark z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-brutal md:shadow-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Brand Header */}
                    <div className="p-4 sm:p-5 border-b-2 border-hima-blue-dark bg-white flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <ApplicationLogo className="h-8 sm:h-9 w-auto" />
                            <div>
                                <h2 className="font-black text-sm sm:text-base text-hima-blue-dark tracking-tight leading-none">
                                    HMIF ASPIRASI
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-hima-red-dark mt-0.5">
                                    Institut LPKIA
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-gray-700 hover:text-black p-1 border border-gray-300"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mahasiswa Info Card */}
                    <div className="p-3.5 sm:p-4 border-b-2 border-hima-blue-dark bg-slate-50">
                        <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 border-2 border-hima-blue-dark object-cover shadow-brutal-sm"
                                />
                            ) : (
                                <div className="w-10 h-10 border-2 border-hima-blue-dark bg-hima-blue-dark text-white font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-hima-blue-dark uppercase truncate" title={user.name}>
                                    {user.name}
                                </p>
                                <p className="text-[11px] font-mono font-bold text-gray-600 truncate">
                                    NIM: {displayNim}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-green-700 uppercase">
                                        Mahasiswa Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-3 sm:p-4 space-y-1.5 flex-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 px-1">
                            Menu Utama
                        </div>

                        {isProfilePage ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full text-left flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border-2 bg-white text-gray-800 border-hima-blue-dark hover:bg-slate-100 transition-all"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span>Feed Aspirasi</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleNavClick('feed')}
                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border-2 transition-all ${
                                    currentNav === 'feed'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm translate-x-0.5'
                                        : 'bg-white text-gray-800 border-hima-blue-dark hover:bg-slate-100'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span>Feed Aspirasi</span>
                            </button>
                        )}

                        {!isProfilePage ? (
                            <button
                                type="button"
                                onClick={() => handleNavClick('create')}
                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border-2 transition-all ${
                                    currentNav === 'create'
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark shadow-brutal-sm translate-x-0.5'
                                        : 'bg-white text-gray-800 border-hima-blue-dark hover:bg-red-50'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Tulis Aspirasi</span>
                            </button>
                        ) : null}

                        {!isProfilePage ? (
                            <button
                                type="button"
                                onClick={() => handleNavClick('my')}
                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border-2 transition-all ${
                                    currentNav === 'my'
                                        ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm translate-x-0.5'
                                        : 'bg-white text-gray-800 border-hima-blue-dark hover:bg-slate-100'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Aspirasi Saya</span>
                            </button>
                        ) : null}

                        <div className="pt-3 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 px-1">
                            Pengaturan
                        </div>

                        <Link
                            href={route('profile.edit')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border-2 transition-all ${
                                isProfilePage
                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm translate-x-0.5'
                                    : 'border-hima-blue-dark text-gray-800 bg-white hover:bg-slate-100'
                            }`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Akun Saya</span>
                        </Link>

                        <Link
                            href="/"
                            className="w-full flex items-center gap-2.5 px-3 py-2 font-bold text-xs uppercase tracking-wide border border-gray-300 text-gray-700 bg-white hover:border-hima-blue-dark hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Beranda Publik</span>
                        </Link>
                    </nav>

                    {/* Bottom Logout Button */}
                    <div className="p-3 sm:p-4 border-t-2 border-hima-blue-dark bg-white">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 border-2 border-hima-red-dark bg-red-50 text-hima-red-dark py-2 px-3 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-dark hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Keluar</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {header && (
                    <header className="bg-white border-b-2 border-hima-blue-dark px-4 py-3 sm:px-6 shadow-brutal-sm">
                        {header}
                    </header>
                )}

                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>

                {/* Dashboard Simple Footer */}
                <footer className="border-t border-gray-300 bg-white px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p className="font-medium">
                        Portal Aspirasi Mahasiswa HIMA IF • Institut LPKIA
                    </p>
                    <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-hima-blue-dark">
                        <span>Pemberdayaan Suara Mahasiswa</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
