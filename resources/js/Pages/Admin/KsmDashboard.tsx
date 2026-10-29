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

            <div className="bg-slate-100 text-black min-h-screen py-4 px-3 sm:px-6 lg:px-8 selection:bg-hima-red-light selection:text-white">
                <div className="max-w-7xl mx-auto space-y-5">
                    {/* TOPBAR ADMIN */}
                    <div className="bg-white border-2 border-hima-blue-dark p-3.5 sm:p-5 shadow-brutal-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border-2 border-hima-blue-dark bg-hima-blue-dark text-white font-black flex items-center justify-center text-sm shadow-xs">
                                KSM
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-black text-base sm:text-lg text-hima-blue-dark uppercase tracking-tight leading-none">
                                        DASHBOARD ADMIN KSM
                                    </h1>
                                    <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-1.5 py-0.5">
                                        KELOLA DATA
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mt-0.5">
                                    Rekapitulasi Kuesioner Survei Kelompok Studi Mahasiswa HIMA IF
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <a
                                href={route('admin.ksm.export')}
                                className="btn-brutal inline-flex items-center gap-1.5 border-2 border-green-800 bg-green-700 text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-xs hover:bg-green-800 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export CSV</span>
                            </a>

                            <Link
                                href={route('ksm.survey.index')}
                                className="btn-brutal inline-flex items-center gap-1.5 border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-xs hover:bg-hima-blue-light transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Form Survei</span>
                            </Link>

                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 border border-gray-400 bg-white text-gray-700 px-3 py-1.5 text-xs font-bold uppercase hover:bg-gray-100 transition-colors shadow-xs"
                            >
                                Dashboard Aspirasi →
                            </Link>
                        </div>
                    </div>

                    {/* METRIK STATISTIK UTAMA */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* 1. Total Responden */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                Total Responden
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-hima-blue-dark font-mono">
                                    {stats.total}
                                </span>
                                <span className="text-xs font-bold text-gray-600">Mahasiswa</span>
                            </div>
                        </div>

                        {/* 2. Rata-rata Minat */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                Minat KSM (Skala 1-4)
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-hima-red-dark font-mono">
                                    {stats.avgInterest}
                                </span>
                                <span className="text-xs font-bold text-gray-600">/ 4.0 Skala</span>
                            </div>
                        </div>

                        {/* 3. Top Bidang Teknologi */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                Top Peminatan Bidang
                            </span>
                            <span className="text-sm sm:text-base font-black text-gray-950 block mt-1 truncate" title={stats.topField}>
                                {stats.topField}
                            </span>
                            <span className="text-[10px] font-bold text-green-700 block mt-0.5">
                                Suara Terbanyak
                            </span>
                        </div>

                        {/* 4. Jadwal Terfavorit */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-sm">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                Jadwal Paling Diminati
                            </span>
                            <span className="text-sm sm:text-base font-black text-gray-950 block mt-1 truncate">
                                {stats.topDay} ({stats.topTime})
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 block mt-0.5">
                                Pilihan Terbanyak
                            </span>
                        </div>
                    </div>

                    {/* BAGIAN REKAPITULASI GRAFIK BAR */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 1. Rekap Peminatan Bidang Teknologi */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm space-y-3">
                            <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                                <h2 className="text-xs sm:text-sm font-black uppercase text-hima-blue-dark">
                                    Peminatan Bidang Teknologi
                                </h2>
                                <span className="text-[10px] font-bold text-gray-500">Maks. 3 Pilihan</span>
                            </div>

                            <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
                                {Object.keys(stats.fieldDistribution).length === 0 ? (
                                    <p className="text-xs text-gray-500 italic py-2">Belum ada data.</p>
                                ) : (
                                    Object.entries(stats.fieldDistribution).map(([field, count]) => {
                                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                        return (
                                            <div key={field} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                                                    <span>{field}</span>
                                                    <span>{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 border border-gray-300 h-3">
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

                        {/* 2. Rekap Bentuk Kegiatan & Matkul Smt 3 */}
                        <div className="space-y-4">
                            {/* Bentuk Kegiatan */}
                            <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm space-y-3">
                                <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                                    <h2 className="text-xs sm:text-sm font-black uppercase text-hima-blue-dark">
                                        Bentuk Kegiatan Pilihan
                                    </h2>
                                    <span className="text-[10px] font-bold text-gray-500">Maks. 2 Pilihan</span>
                                </div>

                                <div className="space-y-2 pt-1">
                                    {Object.entries(stats.activityDistribution).slice(0, 4).map(([act, count]) => {
                                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                        return (
                                            <div key={act} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                                                    <span>{act}</span>
                                                    <span>{count} mhs ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 border border-gray-300 h-2.5">
                                                    <div
                                                        className="bg-hima-red-dark h-full transition-all duration-300"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rekap Hari & Waktu */}
                            <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm space-y-3">
                                <h2 className="text-xs sm:text-sm font-black uppercase text-hima-blue-dark border-b border-gray-200 pb-2">
                                    Preferensi Hari & Waktu Pelaksanaan
                                </h2>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="font-bold text-gray-600 block mb-1">Hari:</span>
                                        <div className="space-y-1">
                                            {Object.entries(stats.dayDistribution).slice(0, 3).map(([day, count]) => (
                                                <div key={day} className="flex justify-between font-bold bg-slate-50 border p-1">
                                                    <span>{day}</span>
                                                    <span>{count} suara</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-600 block mb-1">Waktu:</span>
                                        <div className="space-y-1">
                                            {Object.entries(stats.timeDistribution).map(([time, count]) => (
                                                <div key={time} className="flex justify-between font-bold bg-slate-50 border p-1">
                                                    <span>{time}</span>
                                                    <span>{count} suara</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABEL DATA RESPONDEN LENGKAP */}
                    <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-brutal-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                            <div>
                                <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase">
                                    Data Responden Kuesioner ({surveys.total})
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Daftar mahasiswa yang telah mengisi survei KSM.
                                </p>
                            </div>

                            {/* Search Bar Responden */}
                            <form onSubmit={handleSearch} className="flex gap-1.5 sm:w-72">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, NIM, matkul..."
                                    className="flex-1 px-2.5 py-1 text-xs border-2 border-hima-blue-dark rounded-none focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="btn-brutal px-3 py-1 bg-hima-blue-dark text-white text-xs font-bold uppercase"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Data */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b-2 border-hima-blue-dark text-[11px] font-black uppercase text-hima-blue-dark">
                                        <th className="p-2.5">No</th>
                                        <th className="p-2.5">Nama & NIM</th>
                                        <th className="p-2.5">Kelas</th>
                                        <th className="p-2.5">Matkul Smt 3</th>
                                        <th className="p-2.5">Bidang Minat</th>
                                        <th className="p-2.5">Bentuk Kegiatan</th>
                                        <th className="p-2.5">Jadwal</th>
                                        <th className="p-2.5">Minat</th>
                                        <th className="p-2.5">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                                    {surveys.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-6 text-center text-gray-500 italic">
                                                Belum ada data responden yang sesuai.
                                            </td>
                                        </tr>
                                    ) : (
                                        surveys.data.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-2.5 font-bold font-mono">
                                                    {(surveys.current_page - 1) * 15 + idx + 1}
                                                </td>
                                                <td className="p-2.5">
                                                    <span className="font-bold text-gray-950 block">
                                                        {item.respondent_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                        {item.respondent_nim || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-2.5">
                                                    <span className="inline-block bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                                        {item.respondent_class || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-2.5 font-semibold text-gray-900">
                                                    {item.semester_course}
                                                </td>
                                                <td className="p-2.5">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {item.interested_fields?.map((f) => (
                                                            <span
                                                                key={f}
                                                                className="bg-blue-50 border border-hima-blue-light text-[9px] font-bold text-hima-blue-dark px-1.5 py-0.2"
                                                            >
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-2.5">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {item.activity_types?.map((act) => (
                                                            <span
                                                                key={act}
                                                                className="bg-red-50 border border-hima-red-light text-[9px] font-bold text-hima-red-dark px-1.5 py-0.2"
                                                            >
                                                                {act}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-2.5 text-[11px]">
                                                    <span className="block font-bold">
                                                        {item.preferred_days?.join(', ') || '-'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {item.preferred_time}
                                                    </span>
                                                </td>
                                                <td className="p-2.5">
                                                    <span className="inline-block bg-hima-blue-dark text-white font-black text-[10px] px-1.5 py-0.5">
                                                        Skala {item.interest_scale}
                                                    </span>
                                                </td>
                                                <td className="p-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSurvey(item)}
                                                        className="border border-hima-blue-dark bg-white text-hima-blue-dark px-2 py-0.5 text-[10px] font-bold uppercase hover:bg-hima-blue-dark hover:text-white transition-colors"
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
                            <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-200">
                                {surveys.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 text-xs border font-bold transition-all ${
                                            link.active
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark'
                                                : link.url
                                                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL DETAIL RESPONDEN */}
                {selectedSurvey && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
                        <div className="bg-white border-2 border-hima-blue-dark w-full max-w-lg p-5 sm:p-6 shadow-[8px_8px_0px_0px_#1A467C] space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b-2 border-hima-blue-dark pb-3">
                                <div>
                                    <h3 className="font-black text-sm sm:text-base text-hima-blue-dark uppercase">
                                        Detail Jawaban Responden
                                    </h3>
                                    <p className="text-xs text-gray-600 font-mono">
                                        {selectedSurvey.respondent_name} ({selectedSurvey.respondent_nim || 'Tanpa NIM'})
                                        {selectedSurvey.respondent_class ? ` • Kelas: ${selectedSurvey.respondent_class}` : ''}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSurvey(null)}
                                    className="border border-gray-400 p-1 hover:bg-gray-100"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-2.5">
                                    <div>
                                        <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                            Kelas Mahasiswa:
                                        </span>
                                        <span className="font-black text-gray-900 text-xs">
                                            {selectedSurvey.respondent_class || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                            NIM Responden:
                                        </span>
                                        <span className="font-bold text-gray-900 font-mono text-xs">
                                            {selectedSurvey.respondent_nim || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                        Materi Matkul Smt 3:
                                    </span>
                                    <span className="font-black text-gray-900 text-sm">
                                        {selectedSurvey.semester_course}
                                    </span>
                                </div>

                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                                        Bidang yang Ingin Dipelajari:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedSurvey.interested_fields?.map((f) => (
                                            <span key={f} className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 font-bold">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                                        Bentuk Kegiatan yang Diinginkan:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedSurvey.activity_types?.map((act) => (
                                            <span key={act} className="bg-red-50 border border-hima-red-dark text-hima-red-dark px-2 py-0.5 font-bold">
                                                {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                        Metode Belajar Paling Efektif:
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {selectedSurvey.learning_method}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-slate-50 border p-2.5">
                                    <div>
                                        <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                            Jadwal Hari & Waktu:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {selectedSurvey.preferred_days?.join(', ')} ({selectedSurvey.preferred_time})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-500 uppercase text-[10px] block">
                                            Tingkat Minat:
                                        </span>
                                        <span className="font-black text-hima-blue-dark">
                                            Skala {selectedSurvey.interest_scale} / 4
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                                        Saran / Ide Kegiatan:
                                    </span>
                                    <div className="p-2.5 bg-gray-50 border border-gray-200 text-gray-700 leading-relaxed italic">
                                        {selectedSurvey.feedback || 'Tidak ada saran tambahan.'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSurvey(null)}
                                    className="border border-hima-blue-dark bg-hima-blue-dark text-white px-4 py-1.5 text-xs font-bold uppercase hover:bg-hima-blue-light"
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
