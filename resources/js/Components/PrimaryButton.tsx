import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `btn-brutal inline-flex items-center justify-center border-2 border-hima-blue-dark bg-hima-blue-dark px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-brutal hover:bg-hima-blue-light focus:outline-none ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
