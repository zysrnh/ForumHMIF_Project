import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="bg-blueprint flex min-h-screen flex-col items-center justify-center p-4 selection:bg-hima-blue-light selection:text-white relative overflow-hidden">
            {/* Ambient Floating Accents */}
            <div className="hidden md:block absolute top-8 left-8 w-12 h-12 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
            <div className="hidden md:block absolute bottom-8 right-8 w-14 h-14 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2" />

            <div className="w-full max-w-md z-10 space-y-4">
                {/* Polaroid Logo Badge */}
                <div className="flex justify-center">
                    <Link href="/" className="relative group">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 tape-badge border border-gray-400 z-10" />
                        <div className="bg-white border-2 border-hima-blue-dark p-2 shadow-brutal rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                            <ApplicationLogo className="h-16 w-16 mx-auto object-contain" />
                            <p className="text-[9px] font-black font-mono text-center text-hima-blue-dark mt-1 uppercase tracking-wider">
                                #HIMA_IF
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white border-2 border-hima-blue-dark p-6 sm:p-8 shadow-brutal-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
