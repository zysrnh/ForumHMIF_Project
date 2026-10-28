import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface GuestLayoutProps extends PropsWithChildren {
    maxWidth?: string;
}

export default function Guest({ children, maxWidth = 'max-w-md' }: GuestLayoutProps) {
    return (
        <div className="bg-blueprint flex min-h-screen flex-col items-center justify-center py-4 sm:py-6 px-4 selection:bg-hima-blue-light selection:text-white relative overflow-x-hidden">
            {/* Ambient Floating Accents */}
            <div className="hidden md:block absolute top-6 left-6 w-10 h-10 bg-hima-blue-light/20 border-2 border-hima-blue-dark shadow-brutal pointer-events-none anim-float-1" />
            <div className="hidden md:block absolute bottom-6 right-6 w-12 h-12 bg-hima-red-light/20 border-2 border-hima-red-dark shadow-brutal-red pointer-events-none anim-float-2" />

            <div className={`w-full ${maxWidth} z-10 space-y-3`}>
                {/* Polaroid Logo Badge (Compact) */}
                <div className="flex justify-center">
                    <Link href="/" className="relative group">
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 tape-badge border border-gray-400 z-10" />
                        <div className="bg-white border-2 border-hima-blue-dark p-1.5 shadow-brutal rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
                            <ApplicationLogo className="h-11 w-11 mx-auto object-contain" />
                            <p className="text-[8px] font-black font-mono text-center text-hima-blue-dark mt-0.5 uppercase tracking-wider">
                                #HIMA_IF
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white border-2 border-hima-blue-dark p-4 sm:p-6 shadow-brutal-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
