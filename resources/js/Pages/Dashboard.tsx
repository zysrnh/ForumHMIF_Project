import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-hima-blue-dark tracking-tight uppercase">
                            Dashboard Utama
                        </h1>
                        <p className="text-xs font-semibold text-gray-600">
                            Selamat datang kembali, <span className="text-hima-blue-light">{user.name}</span>!
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-blue-50 border border-hima-blue-light px-2.5 py-1 text-[11px] font-bold text-hima-blue-dark uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Status: Sistem Aktif
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* 4 Stat Cards Neubrutalism */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Stat 1 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-hima-blue-dark">
                                Total Pengurus
                            </p>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-black text-gray-950">48</span>
                                <span className="text-[10px] font-bold text-hima-blue-dark bg-blue-50 border border-hima-blue-light px-2 py-0.5 uppercase">
                                    Anggota
                                </span>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="bg-white border-2 border-green-800 p-4 sm:p-5 shadow-[4px_4px_0px_0px_#166534]">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-green-800">
                                Surat Keluar
                            </p>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-black text-green-800">124</span>
                                <span className="text-[10px] font-bold text-green-900 bg-green-50 border border-green-700 px-2 py-0.5 uppercase">
                                    Arsip
                                </span>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="bg-white border-2 border-hima-red-dark p-4 sm:p-5 shadow-brutal-red">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-hima-red-dark">
                                Agenda Aktif
                            </p>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-black text-hima-red-dark">3</span>
                                <span className="text-[10px] font-bold text-hima-red-dark bg-red-50 border border-hima-red-light px-2 py-0.5 uppercase">
                                    POKJA
                                </span>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-hima-blue-dark">
                                Saldo Kas HIMA
                            </p>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl sm:text-2xl font-black text-gray-950">Rp 12.5M</span>
                                <span className="text-[10px] font-bold text-hima-blue-light bg-blue-50 border border-hima-blue-light px-2 py-0.5 uppercase">
                                    Kas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="bg-white border-2 border-hima-blue-dark p-6 shadow-brutal-lg">
                        <h2 className="text-lg font-black text-hima-blue-dark uppercase tracking-tight mb-2">
                            Akses Cepat Modul Sistem Informasi
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-6">
                            Pilih modul operasional organisasi di bawah ini untuk memulai aktivitas manajemen data HIMA IF.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                                <div className="text-xs font-bold text-hima-blue-dark uppercase">Modul 1</div>
                                <div className="text-base font-black text-gray-950 mt-1">Pengajuan Surat</div>
                                <p className="text-xs text-gray-600 mt-1">Buat permohonan surat izin, delegasi, dan peminjaman inventaris.</p>
                            </div>

                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                                <div className="text-xs font-bold text-hima-blue-dark uppercase">Modul 2</div>
                                <div className="text-base font-black text-gray-950 mt-1">Database Mahasiswa</div>
                                <p className="text-xs text-gray-600 mt-1">Cari dan kelola data mahasiswa aktif serta kepengurusan himpunan.</p>
                            </div>

                            <div className="dot-card border-2 border-hima-blue-dark p-4 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                                <div className="text-xs font-bold text-hima-blue-dark uppercase">Modul 3</div>
                                <div className="text-base font-black text-gray-950 mt-1">Kepanitiaan & Acara</div>
                                <p className="text-xs text-gray-600 mt-1">Sinkronisasi data kegiatan POKJA dan absensi peserta acara.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
