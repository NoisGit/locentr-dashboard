// src/views/auth/SignIn/Side.tsx

import React from 'react';

const Side = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen min-h-screen p-6 bg-white dark:bg-gray-800">
            <div className="flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children}
                </div>
            </div>

            {/* Panel derecho con fondo SVG y recorte por borde redondeado */}
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden rounded-3xl items-end relative max-w-[520px] 2xl:max-w-[720px] overflow-hidden">
                <img
                    src="/img/others/auth-side-bg.svg"      // <-- usa el SVG nuevo en public/
                    className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
                    alt="Login Side Background"
                    loading="eager"
                    decoding="sync"
                    draggable={false}
                />
            </div>
        </div>
    );
};

export default Side;
