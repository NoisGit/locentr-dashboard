import loginHero from '@/assets/locentr-login-hero.jpg'
import { motion, useReducedMotion } from 'framer-motion'
import { TbLock, TbShieldCheck } from 'react-icons/tb'
import type { ReactNode } from 'react'

const Side = ({ children }: { children?: ReactNode }) => {
    const reduceMotion = useReducedMotion()
    const transition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }

    return (
        <div className="min-h-screen bg-[#eef3f1] p-3 sm:p-5 lg:p-6 dark:bg-gray-950">
            <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1600px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,45,40,0.12)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(440px,0.88fr)_minmax(520px,1.12fr)] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
                    <motion.div
                        className="w-full max-w-[430px]"
                        initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={transition}
                    >
                        {children}
                    </motion.div>
                </div>

                <div className="relative hidden min-h-[650px] overflow-hidden lg:block">
                    <motion.img
                        src={loginHero}
                        className="absolute inset-0 h-full w-full select-none object-cover"
                        alt="Edificio moderno gestionado desde Locentr"
                        loading="eager"
                        decoding="sync"
                        draggable={false}
                        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.07 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...transition, duration: reduceMotion ? 0 : 1.2 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#082d2a]/95 via-[#0a4e47]/25 to-transparent" />
                    <motion.div
                        className="absolute right-10 top-10 flex gap-3"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...transition, delay: reduceMotion ? 0 : 0.35 }}
                    >
                        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#082d2a]/45 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                            <TbShieldCheck className="text-base text-[#79d6c5]" />
                            Permisos por rol
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#082d2a]/45 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                            <TbLock className="text-base text-[#79d6c5]" />
                            Sesión temporal
                        </div>
                    </motion.div>
                    <motion.div
                        className="absolute inset-x-0 bottom-0 p-10 xl:p-14"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...transition, delay: reduceMotion ? 0 : 0.2 }}
                    >
                        <div className="max-w-xl border-l border-white/35 pl-7 text-white">
                            <span className="mb-4 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-[#92e0d2]">
                                Operación centralizada
                            </span>
                            <h1 className="mb-4 text-3xl font-semibold leading-tight text-white xl:text-4xl">
                                Controla tus sedes, accesos y equipos desde un solo lugar.
                            </h1>
                            <p className="max-w-lg text-base font-normal leading-7 text-white/80">
                                Locentr conecta la operación diaria de cada ubicación con información clara, trazable y disponible en tiempo real.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Side
