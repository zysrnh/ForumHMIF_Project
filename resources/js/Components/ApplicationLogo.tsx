import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo/logo.png"
            alt="Logo HIMA IF"
            className={`object-contain ${props.className || 'h-10 w-auto'}`}
        />
    );
}
