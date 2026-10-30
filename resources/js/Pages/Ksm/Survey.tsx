import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    user?: {
        name: string;
        email: string;
        nim?: string;
        role?: string;
    } | null;
}

export default function Survey({ user }: Props) {
    const pageProps = usePage().props as { flash?: { success?: string } };
    const successFlash = pageProps.flash?.success;

    // State untuk opsi 'Yang lain'
    const [customCourse, setCustomCourse] = useState('');
    const [customField, setCustomField] = useState('');

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        respondent_name: user?.name || '',
        respondent_nim: user?.nim || (user?.email?.includes('@') ? user.email.split('@')[0] : ''),
        respondent_class: '',
        semester_course: '',
        interested_fields: [] as string[],
        activity_types: [] as string[],
        learning_method: '',
        interest_scale: 4,
        preferred_days: [] as string[],
        preferred_time: '',
        feedback: '',
    });

    const matkulSemester3Options = [
        'Infrastruktur Teknologi Informasi',
        'Jaringan Komputer',
        'Web Framework',
    ];

    const bidangOptions = [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Artificial Intelligence',
        'Cyber Security',
        'Data Science',
        'Game Development',
        'Cloud Computing',
        'DevOps',
        'Internet of Things (IoT)',
    ];

    const bentukKegiatanOptions = [
        'Workshop',
        'Kelas rutin',
        'Mentoring',
        'Study Group',
        'Sharing Session',
        'Project bersama',
        'Bedah tugas',
        'Seminar',
    ];

    const metodeBelajarOptions = [
        'Lebih banyak praktik',
        'Penjelasan teori terlebih dahulu',
        'Praktik langsung membuat project',
        'Diskusi kelompok',
        'Studi Kasus',
        'Kombinasi teori dan praktik',
    ];

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const waktuOptions = ['Pagi', 'Siang', 'Sore', 'Malam'];

    // Handler Checkbox Bidang (Maksimal 3)
    const handleToggleField = (val: string) => {
        if (data.interested_fields.includes(val)) {
            setData(
                'interested_fields',
                data.interested_fields.filter((item) => item !== val),
            );
        } else {
            if (data.interested_fields.length < 3) {
                setData('interested_fields', [...data.interested_fields, val]);
            }
        }
    };

    // Handler Checkbox Bentuk Kegiatan (Maksimal 2)
    const handleToggleActivity = (val: string) => {
        if (data.activity_types.includes(val)) {
            setData(
                'activity_types',
                data.activity_types.filter((item) => item !== val),
            );
        } else {
            if (data.activity_types.length < 2) {
                setData('activity_types', [...data.activity_types, val]);
            }
        }
    };

    // Handler Checkbox Hari (Maksimal 2)
    const handleToggleDay = (val: string) => {
        if (data.preferred_days.includes(val)) {
            setData(
                'preferred_days',
                data.preferred_days.filter((item) => item !== val),
            );
        } else {
            if (data.preferred_days.length < 2) {
                setData('preferred_days', [...data.preferred_days, val]);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ksm.survey.store'), {
            onSuccess: () => {
                reset();
                setCustomCourse('');
                setCustomField('');
            },
        });
    };

    return (
        <>
            <Head title="Kuesioner Survei Minat KSM - HIMA IF" />

            <div className="min-h-screen bg-slate-50 text-black flex flex-col selection:bg-hima-red-light selection:text-white">
                {/* 1. HEADER MENEMPEL PENUH DI ATAS (EDGE-TO-EDGE & STICKY) */}
                <header className="sticky top-0 z-40 bg-white border-b-2 border-hima-blue-dark px-3 py-2 sm:px-6 sm:py-3 shadow-sm w-full">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
                        <Link href="/" className="flex items-center gap-2 min-w-0">
                            <img
                                src="/logo/logo.png"
                                alt="Logo HIMA IF"
                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                            />
                            <div className="min-w-0">
                                <span className="font-black text-hima-blue-dark text-xs sm:text-sm block leading-none truncate">
                                    SURVEI KSM HMIF
                                </span>
                                <span className="text-[9px] font-bold text-hima-red-dark uppercase tracking-wider block mt-0.5 truncate">
                                    Kelompok Studi Mahasiswa
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0">
                            {['admin', 'super_admin'].includes(user?.role || '') && (
                                <Link
                                    href={route('admin.ksm.dashboard')}
                                    className="text-[10px] sm:text-[11px] font-black uppercase text-hima-blue-dark border-2 border-hima-blue-dark px-2.5 py-1 bg-blue-50 hover:bg-hima-blue-dark hover:text-white transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href={user ? route('dashboard') : '/'}
                                className="btn-brutal inline-flex items-center gap-1.5 bg-white text-hima-blue-dark hover:bg-slate-900 hover:text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-hima-blue-dark shadow-brutal-xs transition-all active:translate-x-0.5 active:translate-y-0.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 2. MAIN CONTAINER - BERJARAK & LEGA (ADA NAFAS) */}
                <main className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 pb-28 md:pb-12 space-y-6 sm:space-y-7 flex-1">
                    {/* Notifikasi Berhasil */}
                    {(wasSuccessful || successFlash) && (
                        <div className="bg-green-50 border-2 border-green-700 p-4 sm:p-5 shadow-brutal-xs text-green-950 space-y-2 anim-feed-item">
                            <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                                <span className="w-5 h-5 bg-green-700 text-white flex items-center justify-center text-xs shrink-0 font-mono">
                                    ✓
                                </span>
                                <span>Jawaban Survei KSM Berhasil Dikirim!</span>
                            </div>
                            <p className="text-xs text-green-800 leading-relaxed">
                                Terima kasih atas partisipasimu. Masukanmu akan menjadi dasar kurikulum dan jadwal kegiatan Kelompok Studi Mahasiswa HIMA IF.
                            </p>
                        </div>
                    )}

                    {/* Banner Intro Survei */}
                    <div className="bg-white border-2 border-hima-blue-dark border-t-6 border-t-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-hima-red-dark text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-wider">
                                Formulir Peminatan
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Mahasiswa Teknik Informatika
                            </span>
                        </div>

                        <h1 className="text-base sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight leading-snug">
                            Survei Kebutuhan & Minat Kelompok Studi Mahasiswa (KSM)
                        </h1>

                        <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                            Formulir ini memetakan materi mata kuliah dan bidang teknologi yang paling kamu butuhkan, serta menyesuaikan waktu dan format mentoring agar efektif.
                        </p>

                        <div className="text-[11px] font-bold text-hima-red-dark border-t border-gray-100 pt-2.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-hima-red-dark inline-block shrink-0" />
                            <span>Tanda bintang (*) menandakan pertanyaan wajib diisi.</span>
                        </div>
                    </div>

                    {/* FORM PERTANYAAN */}
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
                        {/* IDENTITAS PENGISI */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <h2 className="text-xs sm:text-sm font-black text-hima-blue-dark uppercase tracking-wide border-b border-gray-100 pb-2">
                                Identitas Responden
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-800 mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.respondent_name}
                                        onChange={(e) => setData('respondent_name', e.target.value)}
                                        placeholder="Contoh: Muhammad Fikri"
                                        className="w-full border-2 border-hima-blue-dark p-2 text-xs sm:text-sm font-bold rounded-none focus:outline-none focus:border-hima-blue-light bg-white"
                                    />
                                    {errors.respondent_name && (
                                        <p className="text-[11px] text-hima-red-dark font-bold mt-1">
                                            {errors.respondent_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-800 mb-1">
                                        NIM Mahasiswa
                                    </label>
                                    <input
                                        type="text"
                                        value={data.respondent_nim}
                                        onChange={(e) => setData('respondent_nim', e.target.value)}
                                        placeholder="Contoh: 230414010"
                                        className="w-full border-2 border-hima-blue-dark p-2 text-xs sm:text-sm font-bold rounded-none focus:outline-none focus:border-hima-blue-light bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-800 mb-1">
                                        Kelas Mahasiswa
                                    </label>
                                    <input
                                        type="text"
                                        value={data.respondent_class}
                                        onChange={(e) => setData('respondent_class', e.target.value)}
                                        placeholder="Contoh: 2IF01"
                                        className="w-full border-2 border-hima-blue-dark p-2 text-xs sm:text-sm font-bold rounded-none focus:outline-none focus:border-hima-blue-light bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PERTANYAAN 1: MATKUL SEMESTER 3 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <div className="space-y-0.5">
                                <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                    Dari mata kuliah semester 3, materi mana yang paling ingin kamu pelajari lebih awal? <span className="text-hima-red-dark">*</span>
                                </label>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Pilih satu materi prioritas yang paling ingin kamu kuasai.
                                </p>
                            </div>

                            <div className="space-y-2 pt-0.5">
                                {matkulSemester3Options.map((opt) => (
                                    <label
                                        key={opt}
                                        className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
                                            data.semester_course === opt
                                                ? 'bg-blue-50 border-hima-blue-dark font-black text-hima-blue-dark'
                                                : 'border-gray-200 hover:border-gray-400 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="semester_course"
                                            value={opt}
                                            checked={data.semester_course === opt}
                                            onChange={() => {
                                                setData('semester_course', opt);
                                                setCustomCourse('');
                                            }}
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer shrink-0"
                                        />
                                        <span className="text-xs sm:text-sm leading-snug">{opt}</span>
                                    </label>
                                ))}

                                {/* Opsi Yang Lain */}
                                <label
                                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 border-2 cursor-pointer transition-all ${
                                        data.semester_course && !matkulSemester3Options.includes(data.semester_course)
                                            ? 'bg-blue-50 border-hima-blue-dark font-black text-hima-blue-dark'
                                            : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 shrink-0">
                                        <input
                                            type="radio"
                                            name="semester_course"
                                            checked={Boolean(data.semester_course && !matkulSemester3Options.includes(data.semester_course))}
                                            onChange={() => {
                                                if (customCourse.trim()) {
                                                    setData('semester_course', customCourse.trim());
                                                }
                                            }}
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer shrink-0"
                                        />
                                        <span className="text-xs sm:text-sm">Yang lain:</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={customCourse}
                                        onChange={(e) => {
                                            setCustomCourse(e.target.value);
                                            setData('semester_course', e.target.value);
                                        }}
                                        placeholder="Ketik mata kuliah lainnya..."
                                        className="flex-1 border-b-2 border-gray-400 bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:border-hima-blue-dark"
                                    />
                                </label>
                            </div>
                            {errors.semester_course && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.semester_course}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 2: BIDANG TEKNOLOGI (MAKSIMAL 3) */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Selain materi perkuliahan, bidang apa yang ingin kamu pelajari? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-bold italic">
                                        (Pilih maksimal 3 bidang)
                                    </p>
                                </div>
                                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.interested_fields.length === 3
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.interested_fields.length} / 3
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                {bidangOptions.map((field) => {
                                    const isSelected = data.interested_fields.includes(field);
                                    const isDisabled = !isSelected && data.interested_fields.length >= 3;

                                    return (
                                        <label
                                            key={field}
                                            className={`flex items-center gap-2.5 p-3 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-hima-blue-dark font-black text-hima-blue-dark'
                                                    : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-gray-400 bg-white cursor-pointer'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => handleToggleField(field)}
                                                className="w-4 h-4 rounded-none border-2 border-hima-blue-dark text-hima-blue-dark focus:ring-0 cursor-pointer shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm leading-snug">{field}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Opsi Tambahan untuk Bidang */}
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 border-t border-gray-100">
                                <span className="text-[11px] font-bold text-gray-700 shrink-0">
                                    Bidang lain yang kamu minati:
                                </span>
                                <div className="flex gap-1.5 flex-1">
                                    <input
                                        type="text"
                                        value={customField}
                                        onChange={(e) => setCustomField(e.target.value)}
                                        placeholder="Contoh: Game 3D, Blockchain..."
                                        className="flex-1 border-2 border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-hima-blue-dark bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customField.trim() && data.interested_fields.length < 3) {
                                                handleToggleField(customField.trim());
                                                setCustomField('');
                                            }
                                        }}
                                        disabled={!customField.trim() || data.interested_fields.length >= 3}
                                        className="btn-brutal px-3 py-1 bg-hima-blue-dark text-white text-xs font-bold disabled:opacity-40 shrink-0"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                            </div>

                            {errors.interested_fields && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.interested_fields}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 3: BENTUK KEGIATAN (MAKSIMAL 2) */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Bentuk kegiatan seperti apa yang paling ingin kamu ikuti? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-bold italic">
                                        (Pilih maksimal 2 bentuk kegiatan)
                                    </p>
                                </div>
                                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.activity_types.length === 2
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.activity_types.length} / 2
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                {bentukKegiatanOptions.map((act) => {
                                    const isSelected = data.activity_types.includes(act);
                                    const isDisabled = !isSelected && data.activity_types.length >= 2;

                                    return (
                                        <label
                                            key={act}
                                            className={`flex items-center gap-2.5 p-3 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-red-50 border-hima-red-dark font-black text-hima-red-dark'
                                                    : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-gray-400 bg-white cursor-pointer'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => handleToggleActivity(act)}
                                                className="w-4 h-4 rounded-none border-2 border-hima-red-dark text-hima-red-dark focus:ring-0 cursor-pointer shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm leading-snug">{act}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.activity_types && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.activity_types}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 4: METODE BELAJAR EFEKTIF */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Menurutmu, metode belajar yang paling efektif seperti apa? <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="space-y-2 pt-0.5">
                                {metodeBelajarOptions.map((m) => (
                                    <label
                                        key={m}
                                        className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
                                            data.learning_method === m
                                                ? 'bg-blue-50 border-hima-blue-dark font-black text-hima-blue-dark'
                                                : 'border-gray-200 hover:border-gray-400 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="learning_method"
                                            value={m}
                                            checked={data.learning_method === m}
                                            onChange={() => setData('learning_method', m)}
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer shrink-0"
                                        />
                                        <span className="text-xs sm:text-sm leading-snug">{m}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.learning_method && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.learning_method}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 5: TINGKAT KETERTARIKAN (SKALA 1 - 4) */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Seberapa tertarik kamu untuk kegiatan KSM? <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="border border-gray-200 p-2.5 sm:p-3 bg-slate-50">
                                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
                                    <span>Tidak tertarik</span>
                                    <span>Sangat tertarik</span>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                    {[1, 2, 3, 4].map((scale) => (
                                        <button
                                            key={scale}
                                            type="button"
                                            onClick={() => setData('interest_scale', scale)}
                                            className={`py-3 px-1 border-2 font-black text-center transition-all ${
                                                data.interest_scale === scale
                                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-xs'
                                                    : 'bg-white text-gray-800 border-gray-300 hover:border-hima-blue-dark'
                                            }`}
                                        >
                                            <span className="block text-base sm:text-lg leading-none">{scale}</span>
                                            <span className="text-[9px] uppercase font-bold block opacity-75 mt-1">
                                                {scale === 1
                                                    ? 'Min'
                                                    : scale === 2
                                                    ? 'Cukup'
                                                    : scale === 3
                                                    ? 'Tertarik'
                                                    : 'Max'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PERTANYAAN 6: HARI YANG MEMUNGKINKAN (MAKSIMAL 2) */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Jika KSM mengadakan kegiatan, hari apa yang paling memungkinkan bagi anda untuk mengikuti kegiatan? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-bold italic">
                                        (Pilih maksimal 2 hari)
                                    </p>
                                </div>
                                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.preferred_days.length === 2
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.preferred_days.length} / 2
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                                {hariOptions.map((day) => {
                                    const isSelected = data.preferred_days.includes(day);
                                    const isDisabled = !isSelected && data.preferred_days.length >= 2;

                                    return (
                                        <label
                                            key={day}
                                            className={`flex items-center gap-2 p-3 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-hima-blue-dark font-black text-hima-blue-dark'
                                                    : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-gray-400 bg-white cursor-pointer'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => handleToggleDay(day)}
                                                className="w-4 h-4 rounded-none border-2 border-hima-blue-dark text-hima-blue-dark focus:ring-0 cursor-pointer shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm">{day}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.preferred_days && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.preferred_days}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 7: WAKTU PELAKSANAAN */}
                        <div className="bg-white border-2 border-hima-blue-dark p-5 sm:p-7 shadow-brutal-xs space-y-4">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Waktu pelaksanaan yang paling anda inginkan adalah <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                                {waktuOptions.map((time) => (
                                    <label
                                        key={time}
                                        className={`flex items-center justify-center p-3 border-2 cursor-pointer transition-all ${
                                            data.preferred_time === time
                                                ? 'bg-hima-blue-dark text-white border-hima-blue-dark font-black'
                                                : 'border-gray-200 hover:border-gray-400 bg-white font-bold'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="preferred_time"
                                            value={time}
                                            checked={data.preferred_time === time}
                                            onChange={() => setData('preferred_time', time)}
                                            className="hidden"
                                        />
                                        <span className="text-xs sm:text-sm">{time}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.preferred_time && (
                                <p className="text-[11px] text-hima-red-dark font-bold">
                                    {errors.preferred_time}
                                </p>
                            )}
                        </div>

                        {/* PERTANYAAN 8: SARAN / IDE LAIN */}
                        <div className="bg-white border-2 border-hima-blue-dark p-3.5 sm:p-5 shadow-sm space-y-2.5">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Apakah kamu memiliki saran atau ide lain untuk kegiatan KSM?
                            </label>
                            <p className="text-[11px] text-gray-500 font-medium">
                                (Tidak wajib diisi, masukkan ide topik atau rekomendasi mentor jika ada)
                            </p>

                            <textarea
                                rows={4}
                                value={data.feedback}
                                onChange={(e) => setData('feedback', e.target.value)}
                                placeholder="Tuliskan saran atau ide kegiatan kamu di sini..."
                                className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-medium rounded-none focus:outline-none focus:border-hima-blue-light resize-none bg-white"
                            />
                        </div>

                        {/* TOMBOL SUBMIT RESPONSIF & MUDAH DIJANGKAU */}
                        <div className="bg-white border-2 border-hima-blue-dark p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="border border-gray-400 bg-white py-2 px-3 text-xs font-bold uppercase text-gray-700 hover:bg-gray-100 transition-colors order-2 sm:order-1 text-center"
                            >
                                Kosongkan Formulir
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-brutal bg-hima-red-dark text-white border-2 border-hima-blue-dark py-3 px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm hover:bg-hima-red-light transition-all disabled:opacity-50 order-1 sm:order-2 text-center"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Jawaban Survei'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Sederhana */}
                    <div className="text-center py-3 text-[11px] font-semibold text-gray-500">
                        Kelompok Studi Mahasiswa (KSM) &bull; HIMA IF Institut LPKIA
                    </div>
                </main>

                {/* ========================================================================= */}
                {/* 3. MOBILE APP BOTTOM NAVIGATION TOOLBAR                                   */}
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
                                Topik
                            </span>
                        </Link>

                        {/* 4. Survei KSM (ACTIVE) */}
                        <Link
                            href={route('ksm.survey.index')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 bg-blue-50/50"
                        >
                            <div className="p-1 border border-hima-blue-dark bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-hima-blue-dark font-black">
                                Survei KSM
                            </span>
                        </Link>

                        {/* 5. Akun / Masuk */}
                        <Link
                            href={user ? route('dashboard') : route('login')}
                            className="group flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
                        >
                            <div className="p-1 border border-transparent group-hover:border-hima-blue-dark group-hover:bg-blue-50 transition-all">
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-hima-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-tight mt-0.5 text-gray-600 group-hover:text-hima-blue-dark font-bold">
                                {user ? 'Akun' : 'Masuk'}
                            </span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
