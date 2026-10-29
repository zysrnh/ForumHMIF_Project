import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface GuestLayoutProps extends PropsWithChildren {
    maxWidth?: string;
}

export default function Guest({ children, maxWidth = 'max-w-md' }: GuestLayoutProps) {
    return (
        <div className="bg-blueprint flex min-h-screen flex-col items-center justify-center py-4 sm:py-6 px-4 pb-24 md:pb-6 selection:bg-hima-blue-light selection:text-white relative overflow-x-hidden">
            {/* Ambient Floating Accents */}
            <div className="hidden md:block absolute top-6 left-6 w-10 h-10 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
            <div className="hidden md:block absolute bottom-6 right-6 w-12 h-12 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2" />

            <div className={`w-full ${maxWidth} z-10 space-y-3`}>
                {/* Polaroid Logo Badge (Compact) */}
                <div className="flex justify-center">
                    <Link href="/" className="relative group">
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 tape-badge border border-gray-400 z-10" />
                        <div className="bg-white border-2 border-hima-blue-dark p-1.5 shadow-brutal rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
                            <ApplicationLogo className="h-11 w-11 mx-auto object-contain" />
                            <p className="text-[8px] font-black font-mono text-center text-hima-blue-dark mt-0.5 uppercase tracking-wider">
                                #HIMA_IF
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-brutal-lg">
                    {children}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MOBILE APP BOTTOM NAVIGATION TOOLBAR                                      */}
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

                    {/* 3. Topik Rame */}
                    <Link
                        href={route('topik.index')}
                        className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                    >
                        <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-red-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                        </div>
                        <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-red-dark font-bold">
                            Topik Rame
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

                    {/* 5. Akun / Masuk (ACTIVE) */}
                    <Link
                        href={route('login')}
                        className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 bg-blue-50/50"
                    >
                        <div className="p-1 border border-hima-blue-dark bg-blue-50 transition-all">
                            <svg className="w-5 h-5 text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="text-[9px] uppercase tracking-tight mt-0.5 text-hima-blue-dark font-black">
                            Masuk
                        </span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
