import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const isGoogleUser = Boolean(user.google_id);
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="border-b-2 border-red-100 pb-3">
                <h2 className="text-sm sm:text-base font-black text-hima-red-dark uppercase tracking-tight">
                    Hapus Akun Mahasiswa
                </h2>

                <p className="text-xs text-gray-600 mt-0.5">
                    Setelah akun dihapus, seluruh data profil, aspirasi yang diajukan, dan riwayat voting akan dihapus secara permanen dari basis data sistem.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="btn-brutal border-2 border-hima-red-dark bg-hima-red-dark text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
                Hapus Akun Saya
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 bg-white border-4 border-hima-red-dark">
                    <h2 className="text-base sm:text-lg font-black text-hima-red-dark uppercase tracking-tight">
                        Konfirmasi Penghapusan Akun
                    </h2>

                    <p className="mt-2 text-xs text-gray-700 leading-relaxed">
                        Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus akun Anda secara permanen?
                        {!isGoogleUser && ' Masukkan password Anda untuk mengonfirmasi.'}
                    </p>

                    {!isGoogleUser && (
                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password"
                                value="Password Konfirmasi"
                                className="text-xs font-bold uppercase text-gray-700 mb-1"
                            />

                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="w-full border-2 border-hima-blue-dark p-2 text-xs font-semibold text-black placeholder-gray-400 focus:outline-none"
                                placeholder="Masukkan password akun"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-1.5 text-xs font-bold text-hima-red-light"
                            />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="border-2 border-gray-400 bg-white px-4 py-1.5 text-xs font-bold uppercase text-gray-700 hover:bg-gray-100"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-brutal border-2 border-hima-red-dark bg-hima-red-dark text-white px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-brutal-sm hover:bg-hima-red-light disabled:opacity-50"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
