import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Sistem Informasi HIMA IF" />

            <div className="bg-blueprint text-[#000000] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-hima-blue-light selection:text-white">
                {/* Floating Geometric Accents */}
                <div className="hidden md:block absolute top-8 left-8 w-14 h-14 bg-hima-blue-light/25 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
                <div className="hidden md:block absolute bottom-12 left-12 w-10 h-10 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2" />
                <div className="hidden md:block absolute top-16 right-12 w-12 h-12 bg-white border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-2" />
                <div className="hidden md:block absolute bottom-8 right-16 w-16 h-16 bg-hima-blue-dark/15 border-2 border-black shadow-[4px_4px_0px_0px_#000000] pointer-events-none anim-float-1" />

                {/* Main Container */}
                <div className="w-full max-w-4xl z-10 my-4 space-y-6">
                    {/* Header Card with Polaroid Badge */}
                    <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Polaroid Logo Badge */}
                            <div className="relative group shrink-0">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 tape-badge border border-gray-400 z-10" />
                                <div className="bg-white border-2 border-hima-blue-dark p-2.5 shadow-brutal rotate-[-2deg] hover:rotate-0 transition-transform duration-300 ease-out cursor-pointer">
                                    <img
                                        src="/logo/logo.png"
                                        alt="Logo HIMA IF"
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto bg-gray-50 border border-gray-200 p-1"
                                    />
                                    <p className="text-[10px] font-black font-mono text-center text-hima-blue-dark mt-2 uppercase tracking-wider">
                                        #HIMA_IF
                                    </p>
                                </div>
                            </div>

                            {/* Headline Section */}
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="inline-flex items-center gap-2 bg-blue-50 border border-hima-blue-light px-3 py-1 text-xs font-bold text-hima-blue-dark uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-hima-blue-light animate-pulse" />
                                    Portal Terpadu Mahasiswa & Pengurus
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black text-hima-blue-dark tracking-tight leading-tight">
                                    SISTEM INFORMASI HIMA IF
                                </h1>
                                <p className="text-sm sm:text-base font-medium text-gray-700 max-w-xl">
                                    Platform digital terintegrasi untuk pengelolaan administrasi, kegiatan kepengurusan, arsip dokumen, serta layanan mahasiswa Teknik Informatika.
                                </p>

                                {/* Navigation / Auth Actions */}
                                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="btn-brutal inline-flex items-center gap-2 bg-hima-blue-light text-white font-bold px-5 py-2.5 border-2 border-hima-blue-dark shadow-brutal text-sm uppercase tracking-wider"
                                        >
                                            Buka Dashboard &rarr;
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="btn-brutal inline-flex items-center gap-2 bg-hima-blue-dark text-white font-bold px-5 py-2.5 border-2 border-hima-blue-dark shadow-brutal text-sm uppercase tracking-wider hover:bg-hima-blue-light"
                                            >
                                                Masuk / Login
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="btn-brutal inline-flex items-center gap-2 bg-white text-hima-blue-dark font-bold px-5 py-2.5 border-2 border-hima-blue-dark shadow-brutal text-sm uppercase tracking-wider hover:bg-gray-100"
                                            >
                                                Daftar Akun
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features / Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Module 1 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-brutal">
                            <div className="flex items-start justify-between">
                                <span className="text-2xl font-black text-hima-blue-dark">01</span>
                                <span className="text-[10px] font-bold text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5 uppercase">
                                    Administrasi
                                </span>
                            </div>
                            <h2 className="mt-3 text-lg font-black text-hima-blue-dark uppercase tracking-tight">
                                Manajemen Surat & Arsip
                            </h2>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Pengarsipan surat masuk, surat keluar, nomor surat otomatis, dan validasi dokumen resmi organisasi.
                            </p>
                        </div>

                        {/* Module 2 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-brutal">
                            <div className="flex items-start justify-between">
                                <span className="text-2xl font-black text-hima-blue-dark">02</span>
                                <span className="text-[10px] font-bold text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5 uppercase">
                                    Database
                                </span>
                            </div>
                            <h2 className="mt-3 text-lg font-black text-hima-blue-dark uppercase tracking-tight">
                                Data Pengurus & Anggota
                            </h2>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Direktori anggota aktif, struktur pengurus tiap divisi, dan inventarisasi data akademik mahasiswa IF.
                            </p>
                        </div>

                        {/* Module 3 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-brutal">
                            <div className="flex items-start justify-between">
                                <span className="text-2xl font-black text-hima-blue-dark">03</span>
                                <span className="text-[10px] font-bold text-hima-red-dark bg-red-50 border border-hima-red-light px-2 py-0.5 uppercase">
                                    Program Kerja
                                </span>
                            </div>
                            <h2 className="mt-3 text-lg font-black text-hima-blue-dark uppercase tracking-tight">
                                Agenda & Event POKJA
                            </h2>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Integrasi agenda kerja HIMA, timeline pelaksanaan kepanitiaan, presensi kegiatan, dan laporan acara.
                            </p>
                        </div>

                        {/* Module 4 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-6 shadow-brutal">
                            <div className="flex items-start justify-between">
                                <span className="text-2xl font-black text-hima-blue-dark">04</span>
                                <span className="text-[10px] font-bold text-green-800 bg-green-50 border border-green-700 px-2 py-0.5 uppercase">
                                    Keuangan
                                </span>
                            </div>
                            <h2 className="mt-3 text-lg font-black text-hima-blue-dark uppercase tracking-tight">
                                Kas & Transparansi Anggaran
                            </h2>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Pencatatan arus kas masuk/keluar kas HIMA, iuran bulanan divisi, dan pelaporan transparansi finansial.
                            </p>
                        </div>
                    </div>

                    {/* Footer Info Card */}
                    <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-hima-blue-dark">HIMA IF</span>
                            <span>&bull;</span>
                            <span>Teknik Informatika</span>
                        </div>
                        <div className="text-gray-500 font-mono text-[11px]">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
