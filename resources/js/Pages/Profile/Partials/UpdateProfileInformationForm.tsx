import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const userNim = user.nim || (user.email.includes('@') ? user.email.split('@')[0] : '250414010');

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="border-b-2 border-gray-100 pb-3 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase tracking-tight">
                        Informasi Profil Mahasiswa
                    </h2>
                    <span className="bg-blue-50 border border-hima-blue-dark text-hima-blue-dark px-2 py-0.5 text-[9px] font-black uppercase">
                        NIM: {userNim}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-0.5">
                    Perbarui nama lengkap dan alamat email fellow yang terdaftar di sistem HIMA IF.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-xs font-black uppercase text-hima-blue-dark mb-1" />

                    <input
                        id="name"
                        type="text"
                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />

                    <InputError className="mt-1.5 text-xs font-bold text-hima-red-light" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Mahasiswa (@fellow.lpkia.ac.id)" className="text-xs font-black uppercase text-hima-blue-dark mb-1" />

                    <input
                        id="email"
                        type="email"
                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-1.5 text-xs font-bold text-hima-red-light" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border-2 border-amber-600 p-3 text-xs font-bold text-amber-900">
                        <p>
                            Alamat email Anda belum terverifikasi.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline font-black text-amber-950 hover:text-black"
                            >
                                Klik di sini untuk mengirim ulang link verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-black text-green-700">
                                Link verifikasi baru telah dikirimkan ke email fellow Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light disabled:opacity-50 transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-black text-green-700 bg-green-50 border border-green-600 px-2.5 py-1">
                            ✓ Perubahan profil berhasil disimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
