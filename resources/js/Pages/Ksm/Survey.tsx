import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    user?: {
        name: string;
        email: string;
        nim?: string;
    } | null;
}

export default function Survey({ user }: Props) {
    const pageProps = usePage().props as { flash?: { success?: string } };
    const successFlash = pageProps.flash?.success;

    // State untuk opsi 'Yang lain'
    const [customCourse, setCustomCourse] = useState('');
    const [customField, setCustomField] = useState('');
    const [customActivity, setCustomActivity] = useState('');

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        respondent_name: user?.name || '',
        respondent_nim: user?.nim || (user?.email?.includes('@') ? user.email.split('@')[0] : ''),
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
                setCustomActivity('');
            },
        });
    };

    return (
        <>
            <Head title="Kuesioner Survei Minat KSM - HIMA IF" />

            <div className="bg-blueprint text-black min-h-screen py-4 px-3 sm:px-6 lg:px-8 selection:bg-hima-red-light selection:text-white">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Header Nav Bar */}
                    <div className="bg-white border-2 border-hima-blue-dark p-3 sm:p-4 shadow-brutal-sm flex items-center justify-between gap-3">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img
                                src="/logo/logo.png"
                                alt="Logo HIMA IF"
                                className="w-8 h-8 object-contain"
                            />
                            <div>
                                <span className="font-black text-hima-blue-dark text-xs sm:text-sm block leading-tight">
                                    SURVEI KSM HMIF
                                </span>
                                <span className="text-[9px] font-bold text-hima-red-dark uppercase tracking-wider block">
                                    Kelompok Studi Mahasiswa
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route('admin.ksm.dashboard')}
                                className="text-[11px] font-black uppercase text-hima-blue-dark border border-hima-blue-dark px-2.5 py-1 bg-blue-50 hover:bg-hima-blue-dark hover:text-white transition-colors"
                            >
                                Dashboard Admin
                            </Link>
                            <Link
                                href={user ? route('dashboard') : '/'}
                                className="text-[11px] font-bold uppercase text-gray-700 border border-gray-400 px-2.5 py-1 bg-white hover:bg-gray-100 transition-colors"
                            >
                                ← Kembali
                            </Link>
                        </div>
                    </div>

                    {/* Notifikasi Berhasil */}
                    {(wasSuccessful || successFlash) && (
                        <div className="bg-green-50 border-2 border-green-700 p-4 shadow-brutal-sm text-green-950 space-y-2">
                            <div className="flex items-center gap-2 font-black text-sm">
                                <span className="w-5 h-5 bg-green-700 text-white flex items-center justify-center text-xs">
                                    ✓
                                </span>
                                <span>Jawaban Survei KSM Berhasil Dikirim!</span>
                            </div>
                            <p className="text-xs text-green-800">
                                Terima kasih atas partisipasimu. Masukanmu akan menjadi dasar kurikulum dan jadwal kegiatan Kelompok Studi Mahasiswa HIMA IF.
                            </p>
                        </div>
                    )}

                    {/* Banner Intro Survei */}
                    <div className="bg-white border-2 border-hima-blue-dark border-t-8 border-t-hima-blue-dark p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1A467C] space-y-3">
                        <div className="inline-block bg-hima-red-dark text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                            Formulir Peminatan Belajar
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-hima-blue-dark uppercase tracking-tight">
                            Survei Kebutuhan & Minat Kelompok Studi Mahasiswa (KSM)
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                            Formulir ini bertujuan untuk memetakan materi matkul dan bidang teknologi yang paling dibutuhkan mahasiswa Teknik Informatika, serta menyesuaikan waktu dan format mentoring agar efektif.
                        </p>
                        <div className="text-[11px] font-bold text-hima-red-dark border-t border-gray-200 pt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-hima-red-dark inline-block" />
                            <span>Tanda bintang (*) menandakan pertanyaan wajib diisi.</span>
                        </div>
                    </div>

                    {/* FORM PERTANYAAN */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* IDENTITAS PENGISI */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <h2 className="text-xs sm:text-sm font-black text-hima-blue-dark uppercase tracking-wide border-b border-gray-200 pb-2">
                                Identitas Responden
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-800 mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.respondent_name}
                                        onChange={(e) => setData('respondent_name', e.target.value)}
                                        placeholder="Contoh: Muhammad Fikri"
                                        className="w-full border-2 border-hima-blue-dark p-2 text-xs sm:text-sm font-semibold rounded-none focus:outline-none focus:border-hima-blue-light"
                                    />
                                    {errors.respondent_name && (
                                        <p className="text-[11px] text-hima-red-dark font-bold mt-1">
                                            {errors.respondent_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-800 mb-1">
                                        NIM Mahasiswa
                                    </label>
                                    <input
                                        type="text"
                                        value={data.respondent_nim}
                                        onChange={(e) => setData('respondent_nim', e.target.value)}
                                        placeholder="Contoh: 230414010"
                                        className="w-full border-2 border-hima-blue-dark p-2 text-xs sm:text-sm font-semibold rounded-none focus:outline-none focus:border-hima-blue-light"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PERTANYAAN 1: MATKUL SEMESTER 3 */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <div className="space-y-1">
                                <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                    Dari mata kuliah semester 3, materi mana yang paling ingin kamu pelajari lebih awal? <span className="text-hima-red-dark">*</span>
                                </label>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Pilih satu materi prioritas yang paling ingin kamu kuasai.
                                </p>
                            </div>

                            <div className="space-y-2 pt-1">
                                {matkulSemester3Options.map((opt) => (
                                    <label
                                        key={opt}
                                        className={`flex items-center gap-3 p-2.5 border-2 cursor-pointer transition-all ${
                                            data.semester_course === opt
                                                ? 'bg-blue-50 border-hima-blue-dark font-bold text-hima-blue-dark'
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
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer"
                                        />
                                        <span className="text-xs sm:text-sm">{opt}</span>
                                    </label>
                                ))}

                                {/* Opsi Yang Lain */}
                                <label
                                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 border-2 cursor-pointer transition-all ${
                                        data.semester_course && !matkulSemester3Options.includes(data.semester_course)
                                            ? 'bg-blue-50 border-hima-blue-dark font-bold text-hima-blue-dark'
                                            : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="semester_course"
                                            checked={Boolean(data.semester_course && !matkulSemester3Options.includes(data.semester_course))}
                                            onChange={() => {
                                                if (customCourse.trim()) {
                                                    setData('semester_course', customCourse.trim());
                                                }
                                            }}
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer"
                                        />
                                        <span className="text-xs sm:text-sm shrink-0">Yang lain:</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={customCourse}
                                        onChange={(e) => {
                                            setCustomCourse(e.target.value);
                                            setData('semester_course', e.target.value);
                                        }}
                                        placeholder="Tuliskan mata kuliah lainnya..."
                                        className="flex-1 border-b-2 border-gray-400 bg-transparent px-2 py-1 text-xs focus:outline-none focus:border-hima-blue-dark"
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Selain materi perkuliahan, bidang apa yang ingin kamu pelajari? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-semibold italic">
                                        (Pilih maksimal 3 bidang)
                                    </p>
                                </div>
                                <span className={`text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.interested_fields.length === 3
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.interested_fields.length} / 3 Terpilih
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {bidangOptions.map((field) => {
                                    const isSelected = data.interested_fields.includes(field);
                                    const isDisabled = !isSelected && data.interested_fields.length >= 3;

                                    return (
                                        <label
                                            key={field}
                                            className={`flex items-center gap-2.5 p-2.5 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-hima-blue-dark font-bold text-hima-blue-dark shadow-xs'
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
                                                className="w-4 h-4 rounded-none border-2 border-hima-blue-dark text-hima-blue-dark focus:ring-0 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm">{field}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Opsi Yang Lain untuk Bidang */}
                            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-700 shrink-0">
                                    Bidang lain yang kamu mau:
                                </span>
                                <div className="flex gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={customField}
                                        onChange={(e) => setCustomField(e.target.value)}
                                        placeholder="Contoh: Blockchain, Game 3D..."
                                        className="flex-1 border-2 border-gray-300 px-2.5 py-1 text-xs focus:outline-none focus:border-hima-blue-dark"
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
                                        className="btn-brutal px-3 py-1 bg-hima-blue-dark text-white text-xs font-bold disabled:opacity-40"
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Bentuk kegiatan seperti apa yang paling ingin kamu ikuti? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-semibold italic">
                                        (Pilih maksimal 2 bentuk kegiatan)
                                    </p>
                                </div>
                                <span className={`text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.activity_types.length === 2
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.activity_types.length} / 2 Terpilih
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {bentukKegiatanOptions.map((act) => {
                                    const isSelected = data.activity_types.includes(act);
                                    const isDisabled = !isSelected && data.activity_types.length >= 2;

                                    return (
                                        <label
                                            key={act}
                                            className={`flex items-center gap-2.5 p-2.5 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-red-50 border-hima-red-dark font-bold text-hima-red-dark shadow-xs'
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
                                                className="w-4 h-4 rounded-none border-2 border-hima-red-dark text-hima-red-dark focus:ring-0 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm">{act}</span>
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Menurutmu, metode belajar yang paling efektif seperti apa? <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="space-y-2 pt-1">
                                {metodeBelajarOptions.map((m) => (
                                    <label
                                        key={m}
                                        className={`flex items-center gap-3 p-2.5 border-2 cursor-pointer transition-all ${
                                            data.learning_method === m
                                                ? 'bg-blue-50 border-hima-blue-dark font-bold text-hima-blue-dark'
                                                : 'border-gray-200 hover:border-gray-400 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="learning_method"
                                            value={m}
                                            checked={data.learning_method === m}
                                            onChange={() => setData('learning_method', m)}
                                            className="w-4 h-4 text-hima-blue-dark focus:ring-0 cursor-pointer"
                                        />
                                        <span className="text-xs sm:text-sm">{m}</span>
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-4">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Seberapa tertarik kamu untuk kegiatan KSM? <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="border border-gray-200 p-3 sm:p-4 bg-slate-50">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                                    <span>Tidak tertarik</span>
                                    <span>Sangat tertarik</span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((scale) => (
                                        <button
                                            key={scale}
                                            type="button"
                                            onClick={() => setData('interest_scale', scale)}
                                            className={`p-3 border-2 font-black text-base text-center transition-all ${
                                                data.interest_scale === scale
                                                    ? 'bg-hima-blue-dark text-white border-hima-blue-dark shadow-brutal-sm scale-102'
                                                    : 'bg-white text-gray-800 border-gray-300 hover:border-hima-blue-dark'
                                            }`}
                                        >
                                            <span className="block">{scale}</span>
                                            <span className="text-[9px] uppercase font-bold block text-gray-400 mt-0.5">
                                                {scale === 1
                                                    ? 'Level 1'
                                                    : scale === 2
                                                    ? 'Level 2'
                                                    : scale === 3
                                                    ? 'Level 3'
                                                    : 'Level 4'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PERTANYAAN 6: HARI YANG MEMUNGKINKAN (MAKSIMAL 2) */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                        Jika KSM mengadakan kegiatan, hari apa yang paling memungkinkan bagi anda untuk mengikuti kegiatan? <span className="text-hima-red-dark">*</span>
                                    </label>
                                    <p className="text-[11px] text-gray-600 font-semibold italic">
                                        (Pilih maksimal 2 hari yang paling memungkinkan)
                                    </p>
                                </div>
                                <span className={`text-xs font-black px-2 py-0.5 border shrink-0 ${
                                    data.preferred_days.length === 2
                                        ? 'bg-hima-red-dark text-white border-hima-red-dark'
                                        : 'bg-slate-100 text-hima-blue-dark border-hima-blue-dark'
                                }`}>
                                    {data.preferred_days.length} / 2 Hari
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {hariOptions.map((day) => {
                                    const isSelected = data.preferred_days.includes(day);
                                    const isDisabled = !isSelected && data.preferred_days.length >= 2;

                                    return (
                                        <label
                                            key={day}
                                            className={`flex items-center gap-2 p-2.5 border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-hima-blue-dark font-bold text-hima-blue-dark'
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
                                                className="w-4 h-4 rounded-none border-2 border-hima-blue-dark text-hima-blue-dark focus:ring-0 cursor-pointer"
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Waktu pelaksanaan yang paling anda inginkan adalah <span className="text-hima-red-dark">*</span>
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                {waktuOptions.map((time) => (
                                    <label
                                        key={time}
                                        className={`flex items-center justify-center gap-2 p-2.5 border-2 cursor-pointer transition-all ${
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
                        <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-sm space-y-3">
                            <label className="block text-xs sm:text-sm font-black text-gray-950 leading-snug">
                                Apakah kamu memiliki saran atau ide lain untuk kegiatan KSM?
                            </label>
                            <p className="text-[11px] text-gray-500 font-medium">
                                (Tidak wajib diisi, masukkan ide topik atau masukan teknis bila ada)
                            </p>

                            <textarea
                                rows={4}
                                value={data.feedback}
                                onChange={(e) => setData('feedback', e.target.value)}
                                placeholder="Tuliskan saran atau ide kegiatan kamu di sini..."
                                className="w-full border-2 border-hima-blue-dark p-3 text-xs sm:text-sm font-medium rounded-none focus:outline-none focus:border-hima-blue-light resize-none"
                            />
                        </div>

                        {/* TOMBOL SUBMIT */}
                        <div className="bg-white border-2 border-hima-blue-dark p-4 shadow-brutal-sm flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="border border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Kosongkan Formulir
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-brutal bg-hima-red-dark text-white border-2 border-hima-blue-dark px-7 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all disabled:opacity-50"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Jawaban Survei'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Sederhana */}
                    <div className="text-center py-4 text-xs font-semibold text-gray-500">
                        Kelompok Studi Mahasiswa (KSM) &bull; Himpunan Mahasiswa Teknik Informatika (HIMA IF)
                    </div>
                </div>
            </div>
        </>
    );
}
