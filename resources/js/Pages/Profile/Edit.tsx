import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;
    const isGoogleUser = Boolean(user.google_id);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-hima-blue-dark text-white text-[10px] font-black uppercase px-2 py-0.5">
                                Profil Mahasiswa
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-600">
                                {isGoogleUser ? 'Akun Google SSO' : 'Akun Manual'}
                            </span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-black text-hima-blue-dark uppercase tracking-tight mt-1">
                            Pengaturan Akun & Profil
                        </h1>
                        <p className="text-xs text-gray-600 font-medium">
                            Kelola data diri, verifikasi email fellow kampus, dan status autentikasi akun Anda.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Akun" />

            {/* FULL WIDTH CONTAINER TANPA GAP SAMPING */}
            <div className="w-full space-y-3.5">
                {/* 1. INFORMASI PROFIL MAHASISWA */}
                <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="w-full"
                    />
                </div>

                {/* 2. KEAMANAN / GANTI PASSWORD (KONDISIONAL GOOGLE SSO) */}
                {isGoogleUser ? (
                    /* JIKA LOGIN GOOGLE: HIDE FORM GANTI PASSWORD & TAMPILKAN STATUS GOOGLE SSO */
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm">
                        <div className="border-b-2 border-gray-100 pb-3 mb-4">
                            <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase tracking-tight flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Keamanan & Autentikasi Google SSO
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Status koneksi akun autentikasi portal mahasiswa Institut LPKIA.
                            </p>
                        </div>

                        <div className="bg-blue-50/70 border-2 border-hima-blue-dark p-4 shadow-[2px_2px_0px_0px_#1A467C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border-2 border-hima-blue-dark flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase text-hima-blue-dark">
                                            Terhubung via Google Fellow LPKIA
                                        </span>
                                        <span className="bg-green-100 border border-green-700 text-green-900 text-[9px] font-black uppercase px-1.5 py-0.2">
                                            Aktif
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                                        Email: <span className="font-mono text-hima-blue-dark">{user.email}</span>
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-300 px-2.5 py-1">
                                Password Dikelola Akun Google Kampus
                            </span>
                        </div>

                        <p className="text-[11px] font-medium text-gray-600 mt-3 leading-relaxed">
                            Karena akun Anda terdaftar menggunakan akun Single Sign-On (SSO) Google Fellow resmi LPKIA, Anda tidak memerlukan password terpisah di sistem ini. Penggantian password atau pemulihan akun dilakukan langsung melalui Google Workspace Institut LPKIA.
                        </p>
                    </div>
                ) : (
                    /* JIKA DAFTAR MANUAL: TAMPILKAN FORM GANTI PASSWORD */
                    <div className="w-full bg-white border-2 border-hima-blue-dark p-4 sm:p-5 shadow-brutal-sm">
                        <UpdatePasswordForm className="w-full" />
                    </div>
                )}

                {/* 3. HAPUS AKUN MAHASISWA */}
                <div className="w-full bg-white border-2 border-hima-red-dark p-4 sm:p-5 shadow-brutal-red">
                    <DeleteUserForm className="w-full" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
