import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="border-b-2 border-gray-100 pb-3 mb-4">
                <h2 className="text-sm sm:text-base font-black text-hima-blue-dark uppercase tracking-tight">
                    Perbarui Password Akun
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                    Gunakan password yang kuat dan aman untuk melindungi akun forum mahasiswa Anda.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Password Saat Ini"
                        className="text-xs font-black uppercase text-hima-blue-dark mb-1"
                    />

                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-1.5 text-xs font-bold text-hima-red-light"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password Baru"
                        className="text-xs font-black uppercase text-hima-blue-dark mb-1"
                    />

                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-1.5 text-xs font-bold text-hima-red-light" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password Baru"
                        className="text-xs font-black uppercase text-hima-blue-dark mb-1"
                    />

                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="w-full border-2 border-hima-blue-dark p-2.5 text-xs sm:text-sm font-semibold text-black placeholder-gray-400 focus:outline-none focus:border-hima-blue-light rounded-none shadow-[2px_2px_0px_0px_#1A467C]"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5 text-xs font-bold text-hima-red-light"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-brutal border-2 border-hima-blue-dark bg-hima-blue-dark text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-blue-light disabled:opacity-50 transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Password'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-black text-green-700 bg-green-50 border border-green-600 px-2.5 py-1">
                            ✓ Password berhasil diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
