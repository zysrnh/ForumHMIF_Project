import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                hima: {
                    'blue-light': '#2A82C6',
                    'blue-dark': '#1A467C',
                    'red-light': '#CA2C2A',
                    'red-dark': '#901C1A',
                    'yellow': '#FACC15',
                    'yellow-hover': '#EAB308',
                },
            },
            boxShadow: {
                'brutal-sm': '2px 2px 0px 0px #1A467C',
                'brutal': '4px 4px 0px 0px #1A467C',
                'brutal-md': '6px 6px 0px 0px #1A467C',
                'brutal-lg': '8px 8px 0px 0px #1A467C',
                'brutal-red': '4px 4px 0px 0px #901C1A',
                'brutal-red-lg': '8px 8px 0px 0px #901C1A',
            },
        },
    },

    plugins: [forms],
};
