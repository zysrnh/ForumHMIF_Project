import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

interface Props {
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

export default function KsmDashboard({ surveys, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.ksm.dashboard'),
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Dashboard Admin KSM - HIMA IF" />

            <div className="bg-slate-100 text-slate-900 min-h-screen py-5 px-3 sm:px-6 lg:px-8 selection:bg-hima-red-light selection:text-white">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* TOPBAR ADMIN FLAT MINIMALIS */}
                    <div className="bg-white border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border border-slate-300 bg-slate-900 text-white font-black flex items-center justify-center text-xs tracking-wider shrink-0">
                                KSM
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                                        Rekapitulasi Survei KSM
                                    </h1>
                                    <span className="bg-red-50 border border-red-200 text-red-700 text-[9px] font-black uppercase px-1.5 py-0.5">
                                        ADMIN PANEL
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Data survei kebutuhan materi, peminatan teknologi, dan jadwal belajar mahasiswa HIMA IF.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <a
                                href={route('admin.ksm.export')}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export CSV</span>
                            </a>

                            <Link
                                href={route('ksm.survey.index')}
                                className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Form Survei</span>
                            </Link>

                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <span>Dashboard Aspirasi →</span>
                            </Link>
                        </div>
                    </div>

                    {/* METRIK STATISTIK UTAMA FLAT MINIMALIS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* 1. Total Responden */}
                        <div className="bg-white border border-slate-200 p-4 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Responden
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                                    {stats.total}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">Mahasiswa</span>
                            </div>
                        </div>

                        {/* 2. Rata-rata Minat */}
                        <div className="bg-white border border-slate-200 p-4 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Minat KSM (Skala 1-4)
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                                    {stats.avgInterest}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">/ 4.0 Skala</span>
                            </div>
                        </div>

                        {/* 3. Top Bidang Teknologi */}
                        <div className="bg-white border border-slate-200 p-4 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Top Peminatan Bidang
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 block truncate" title={stats.topField}>
                                {stats.topField}
                            </span>
                            <span className="text-[10px] font-medium text-emerald-600 block">
                                Suara Terbanyak
                            </span>
                        </div>

                        {/* 4. Jadwal Terfavorit */}
                        <div className="bg-white border border-slate-200 p-4 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Jadwal Paling Diminati
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
                                {stats.topDay} ({stats.topTime})
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 block">
                                Pilihan Terbanyak
                            </span>
                        </div>
                    </div>

                    {/* BAGIAN REKAPITULASI GRAFIK BAR FLAT MINIMALIS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 1. Rekap Peminatan Bidang Teknologi */}
                        <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-3">
                            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800">
                                    Peminatan Bidang Teknologi
                                </h2>
                                <span className="text-[10px] font-medium text-slate-400">Maks. 3 Pilihan</span>
                            </div>

                            <div className="space-y-2.5 pt-1 max-h-72 overflow-y-auto pr-1">
                                {Object.keys(stats.fieldDistribution).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">Belum ada data peminatan.</p>
                                ) : (
                                    Object.entries(stats.fieldDistribution).map(([field, count]) => {
                                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                        return (
                                            <div key={field} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                    <span>{field}</span>
                                                    <span className="font-mono text-slate-500">{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 overflow-hidden">
                                                    <div
                                                        className="bg-hima-blue-dark h-full transition-all duration-300"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* 2. Rekap Bentuk Kegiatan & Jadwal */}
                        <div className="space-y-4">
                            {/* Bentuk Kegiatan */}
                            <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-3">
                                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800">
                                        Bentuk Kegiatan Pilihan
                                    </h2>
                                    <span className="text-[10px] font-medium text-slate-400">Maks. 2 Pilihan</span>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                    {Object.entries(stats.activityDistribution).slice(0, 4).map(([act, count]) => {
                                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                        return (
                                            <div key={act} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                    <span>{act}</span>
                                                    <span className="font-mono text-slate-500">{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 overflow-hidden">
                                                    <div
                                                        className="bg-red-600 h-full transition-all duration-300"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rekap Hari & Waktu */}
                            <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-3">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800 border-b border-slate-100 pb-2.5">
                                    Preferensi Hari & Waktu Pelaksanaan
                                </h2>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="font-semibold text-slate-500 block mb-1.5 text-[11px] uppercase">
                                            Pilihan Hari:
                                        </span>
                                        <div className="space-y-1">
                                            {Object.entries(stats.dayDistribution).slice(0, 3).map(([day, count]) => (
                                                <div key={day} className="flex justify-between items-center bg-slate-50 px-2.5 py-1 text-slate-700">
                                                    <span className="font-medium">{day}</span>
                                                    <span className="font-mono text-slate-500 text-[11px]">{count} suara</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-500 block mb-1.5 text-[11px] uppercase">
                                            Pilihan Waktu:
                                        </span>
                                        <div className="space-y-1">
                                            {Object.entries(stats.timeDistribution).map(([time, count]) => (
                                                <div key={time} className="flex justify-between items-center bg-slate-50 px-2.5 py-1 text-slate-700">
                                                    <span className="font-medium">{time}</span>
                                                    <span className="font-mono text-slate-500 text-[11px]">{count} suara</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABEL DATA RESPONDEN LENGKAP FLAT MINIMALIS */}
                    <div className="bg-white border border-slate-200 p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                    Data Responden Kuesioner ({surveys.total})
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Daftar mahasiswa yang telah mengisi survei minat KSM.
                                </p>
                            </div>

                            {/* Search Bar Responden */}
                            <form onSubmit={handleSearch} className="flex gap-1 sm:w-72">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, NIM, kelas..."
                                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase transition-colors"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Data Clean Minimalist */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="p-3">No</th>
                                        <th className="p-3">Responden</th>
                                        <th className="p-3">Kelas</th>
                                        <th className="p-3">Matkul Smt 3</th>
                                        <th className="p-3">Bidang Minat</th>
                                        <th className="p-3">Bentuk Kegiatan</th>
                                        <th className="p-3">Jadwal</th>
                                        <th className="p-3">Minat</th>
                                        <th className="p-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {surveys.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                                                Belum ada data responden yang sesuai.
                                            </td>
                                        </tr>
                                    ) : (
                                        surveys.data.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-3 font-mono text-slate-400">
                                                    {(surveys.current_page - 1) * 15 + idx + 1}
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
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {item.activity_types?.map((act) => (
                                                            <span
                                                                key={act}
                                                                className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-medium px-1.5 py-0.2"
                                                            >
                                                                {act}
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
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSurvey(item)}
                                                        className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-900 hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
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
                        {surveys.links && surveys.links.length > 3 && (
                            <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
                                {surveys.links.map((link, i) => (
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
                </div>

                {/* MODAL DETAIL RESPONDEN FLAT MINIMALIS */}
                {selectedSurvey && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
                        <div className="bg-white border border-slate-300 w-full max-w-lg p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 tracking-tight">
                                        Detail Jawaban Responden
                                    </h3>
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
                                        Bidang yang Ingin Dipelajari:
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
                                        Bentuk Kegiatan yang Diinginkan:
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
                                        Metode Belajar Paling Efektif:
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {selectedSurvey.learning_method}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3">
                                    <div>
                                        <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                            Jadwal Hari & Waktu:
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {selectedSurvey.preferred_days?.join(', ')} ({selectedSurvey.preferred_time})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                                            Tingkat Minat:
                                        </span>
                                        <span className="font-bold text-hima-blue-dark font-mono">
                                            Skala {selectedSurvey.interest_scale} / 4
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
                                        Saran / Ide Kegiatan:
                                    </span>
                                    <div className="p-3 bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed italic">
                                        {selectedSurvey.feedback || 'Tidak ada saran tambahan.'}
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
        </>
    );
}
