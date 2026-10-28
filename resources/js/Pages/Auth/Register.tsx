import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-xl">
            <Head title="Daftar Akun Forum HMIF" />

            {/* Header Form */}
            <div className="border-b-2 border-hima-blue-dark pb-2.5 mb-3 flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight">
                        Daftar Akun Mahasiswa
                    </h1>
                    <p className="text-[11px] font-semibold text-gray-600">
                        Suarakan aspirasimu dan ikut menentukan arah KSM Himpunan Mahasiswa Informatika.
                    </p>
                </div>
                <span className="hidden sm:inline-block bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[9px] font-black uppercase">
                    LPKIA FELLOW
                </span>
            </div>

            {/* 1. TOMBOL GOOGLE REGISTER CEPAT */}
            <div className="space-y-1.5 mb-3">
                <a
                    href={route('auth.google')}
                    className="btn-brutal w-full flex items-center justify-center gap-2.5 bg-white border-2 border-hima-blue-dark py-2 px-3 shadow-[3px_3px_0px_0px_#1A467C] text-xs sm:text-sm font-black text-hima-blue-dark uppercase tracking-wider hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <span>Daftar Cepat via Google Fellow (@fellow.lpkia.ac.id)</span>
                </a>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2.5">
                <div className="border-t-2 border-hima-blue-dark/20 w-full" />
                <span className="bg-white px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 absolute">
                    Atau Daftar Manual
                </span>
            </div>

            {/* 2. CATATAN KEAMANAN PENTING (PASSWORD HARUS BEDA) */}
            <div className="bg-amber-50 border border-amber-600 p-2 mb-3 text-[10px] sm:text-[11px] font-semibold text-amber-900 leading-tight">
                <strong className="font-black uppercase tracking-wider text-amber-950">Catatan Keamanan: </strong>
                Gunakan password yang <u>BERBEDA</u> dengan akun portal kampus aslimu demi keamanan data!
            </div>

            {/* 3. FORM REGISTRASI GRID 2 KOLOM DI DESKTOP */}
            <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nama Lengkap */}
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-[11px] font-bold text-gray-700 uppercase" />
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            placeholder="contoh: Zaki Yusron"
                            className="mt-1 block w-full border-2 border-hima-blue-dark p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1 text-[11px] font-bold text-hima-red-light" />
                    </div>

                    {/* Email Kampus */}
                    <div>
                        <InputLabel htmlFor="email" value="Email (@fellow.lpkia.ac.id)" className="text-[11px] font-bold text-gray-700 uppercase" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="250414010@fellow.lpkia.ac.id"
                            className="mt-1 block w-full border-2 border-hima-blue-dark p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1 text-[11px] font-bold text-hima-red-light" />
                    </div>

                    {/* Password */}
                    <div>
                        <InputLabel htmlFor="password" value="Password Baru" className="text-[11px] font-bold text-gray-700 uppercase" />
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="minimal 8 karakter"
                            className="mt-1 block w-full border-2 border-hima-blue-dark p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-1 text-[11px] font-bold text-hima-red-light" />
                    </div>

                    {/* Konfirmasi Password */}
                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Konfirmasi Password"
                            className="text-[11px] font-bold text-gray-700 uppercase"
                        />
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="ulangi password baru"
                            className="mt-1 block w-full border-2 border-hima-blue-dark p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1 text-[11px] font-bold text-hima-red-light"
                        />
                    </div>
                </div>

                {/* Tombol Submit & Link Login */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 order-2 sm:order-1">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="font-black text-hima-blue-dark hover:underline"
                        >
                            Masuk di Sini &rarr;
                        </Link>
                    </p>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-brutal w-full sm:w-auto bg-hima-red-light text-white font-black py-2.5 px-6 border-2 border-hima-blue-dark shadow-[3px_3px_0px_0px_#1A467C] text-xs sm:text-sm uppercase tracking-wider hover:bg-hima-red-dark disabled:opacity-50 order-1 sm:order-2"
                    >
                        {processing ? 'Mendaftarkan...' : 'Daftar Akun Mahasiswa'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
