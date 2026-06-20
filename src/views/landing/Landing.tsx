import { useRef } from 'react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
    TbArrowUpRight,
    TbBuildingSkyscraper,
    TbCheck,
    TbCircleCheckFilled,
    TbCreditCard,
    TbFileDescription,
    TbFingerprint,
    TbBrandGithub,
    TbBrandInstagram,
    TbBrandLinkedin,
    TbLock,
    TbNotebook,
    TbShieldCheck,
    TbSparkles,
    TbUsersGroup,
} from 'react-icons/tb'
import { apiListPlans } from '@/services/SubscriptionsService'
import locentrIcon from '@/assets/locentr-icon.svg'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const fallbackPlans = [
    {
        code: 'STARTER',
        name: 'Starter',
        description: 'Para operaciones que están ordenando su primera sede.',
        monthly_price_cents: 4900,
        qty_locations: 2,
        qty_admins: 2,
        qty_operators: 10,
        qty_daily_reads: 500,
    },
    {
        code: 'GROWTH',
        name: 'Growth',
        description: 'Para empresas con varias sedes y equipos en expansión.',
        monthly_price_cents: 12900,
        qty_locations: 10,
        qty_admins: 5,
        qty_operators: 50,
        qty_daily_reads: 5000,
    },
    {
        code: 'SCALE',
        name: 'Scale',
        description: 'Para operaciones críticas con control centralizado.',
        monthly_price_cents: 29900,
        qty_locations: 50,
        qty_admins: 15,
        qty_operators: 250,
        qty_daily_reads: 25000,
    },
]

const features = [
    {
        icon: TbBuildingSkyscraper,
        title: 'Empresas y sedes',
        text: 'Administra estructuras empresariales, subempresas y ubicaciones desde un solo tenant.',
    },
    {
        icon: TbFingerprint,
        title: 'Control de accesos',
        text: 'Listas blancas y negras, ingresos, salidas y trazabilidad diaria en tiempo real.',
    },
    {
        icon: TbUsersGroup,
        title: 'Equipo y permisos',
        text: 'Invitaciones seguras, roles, cupos por plan y límites aplicados desde el backend.',
    },
    {
        icon: TbFileDescription,
        title: 'Documentos privados',
        text: 'Archivos vinculados a empresas y ubicaciones con acceso temporal y validaciones.',
    },
    {
        icon: TbNotebook,
        title: 'Libro de novedades',
        text: 'Incidentes operativos, registros por sede y acceso controlado para autoridades.',
    },
    {
        icon: TbCreditCard,
        title: 'Billing SaaS',
        text: 'Trial de 14 días, planes, Stripe, facturas, pagos fallidos y portal de cliente.',
    },
]

const metrics = [
    ['14 días', 'de prueba gratuita'],
    ['4 roles', 'con permisos definidos'],
    ['100%', 'trazabilidad operativa'],
]

const Landing = () => {
    const root = useRef<HTMLElement>(null)
    const { data: remotePlans } = useSWR('landing:plans', apiListPlans)
    const plans = remotePlans?.length ? remotePlans : fallbackPlans

    useGSAP(
        () => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (reduceMotion) {
                gsap.set('.landing-reveal, .landing-feature, .landing-dashboard', {
                    clearProps: 'all',
                })
                return
            }

            const intro = gsap.timeline({
                defaults: { ease: 'power3.out' },
            })
            intro
                .from('.landing-nav', {
                    y: -24,
                    autoAlpha: 0,
                    duration: 0.7,
                })
                .from(
                    '.landing-hero-copy > *',
                    {
                        y: 34,
                        autoAlpha: 0,
                        stagger: 0.09,
                        duration: 0.8,
                    },
                    '-=0.35',
                )
                .from(
                    '.landing-dashboard',
                    {
                        y: 50,
                        scale: 0.96,
                        autoAlpha: 0,
                        duration: 1,
                    },
                    '-=0.55',
                )

            gsap.utils.toArray<HTMLElement>('.landing-reveal').forEach((section) => {
                gsap.from(section, {
                    y: 42,
                    autoAlpha: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 84%',
                        once: true,
                    },
                })
            })

            ScrollTrigger.batch('.landing-feature', {
                start: 'top 88%',
                once: true,
                onEnter: (elements) =>
                    gsap.from(elements, {
                        y: 38,
                        autoAlpha: 0,
                        stagger: 0.09,
                        duration: 0.75,
                        ease: 'power3.out',
                    }),
            })
        },
        { scope: root },
    )

    return (
        <main ref={root} className="min-h-screen overflow-hidden bg-[#081018] text-[#f8fafc]">
            <nav className="landing-nav relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
                <Link className="flex items-center gap-3" to="/">
                    <img className="h-10 w-10" src={locentrIcon} alt="Locentr" />
                    <span className="text-xl font-bold tracking-tight">locentr</span>
                </Link>
                <div className="hidden items-center gap-7 text-sm text-white/65 md:flex">
                    <a href="#producto">Producto</a>
                    <a href="#seguridad">Seguridad</a>
                    <a href="#planes">Planes</a>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-white/75 transition hover:text-white sm:block"
                        to="/auth/sign-in"
                    >
                        Ingresar
                    </Link>
                    <Link
                        className="rounded-xl bg-[#2f5f9f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4f7fbd]"
                        to="/start-trial"
                    >
                        Probar gratis
                    </Link>
                </div>
            </nav>

            <section className="relative mx-auto grid min-h-[610px] max-w-7xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:pt-4">
                <div className="landing-hero-copy relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#7fa7e6]/25 bg-[#7fa7e6]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#a8c3ee]">
                        <TbSparkles />
                        Operaciones empresariales, en orden
                    </div>
                    <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#f8fafc] sm:text-6xl lg:text-7xl">
                        Todo lo que ocurre en tus sedes,{' '}
                        <span className="text-[#a8c3ee]">bajo control.</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
                        Locentr reúne empresas, accesos, equipos, documentos, auditoría, novedades y
                        soporte en una plataforma SaaS diseñada para operar con claridad.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2f5f9f] px-6 py-3.5 font-bold text-white transition hover:bg-[#4f7fbd]"
                            to="/start-trial"
                        >
                            Comenzar 14 días gratis
                            <TbArrowUpRight />
                        </Link>
                        <Link
                            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                            to="/auth/sign-in"
                        >
                            Ver plataforma
                        </Link>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-sm text-white/45">
                        <TbCircleCheckFilled className="text-[#a8c3ee]" />
                        Sin tarjeta. Configuración inicial incluida.
                    </p>
                </div>

                <div className="landing-dashboard relative z-10 will-change-transform">
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#152130] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
                        <div className="flex items-center gap-2 border-b border-white/8 px-3 py-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#7fa7e6]/80" />
                            <span className="ml-4 text-xs text-white/50">
                                app.locentr.com/dashboard
                            </span>
                        </div>
                        <div className="grid min-h-[410px] grid-cols-[80px_1fr] sm:grid-cols-[172px_1fr]">
                            <aside className="border-r border-white/8 p-3 sm:p-5">
                                <div className="mb-6 flex items-center gap-2">
                                    <img className="h-8 w-8" src={locentrIcon} alt="" />
                                    <span className="hidden font-bold sm:block">locentr</span>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        'Panel',
                                        'Empresas',
                                        'Usuarios',
                                        'Edificios',
                                        'Accesos',
                                        'Documentos',
                                    ].map((item, index) => (
                                        <div
                                            key={item}
                                            className={`rounded-lg px-3 py-2.5 text-xs ${
                                                index === 0
                                                    ? 'bg-[#7fa7e6]/15 font-semibold text-[#a8c3ee]'
                                                    : 'text-white/52'
                                            }`}
                                        >
                                            <span className="hidden sm:block">{item}</span>
                                            <span className="mx-auto block h-2 w-2 rounded-full bg-current sm:hidden" />
                                        </div>
                                    ))}
                                </div>
                            </aside>
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white/55">
                                            Viernes, 12 de junio
                                        </p>
                                        <h3 className="mt-1 text-xl text-white">
                                            Resumen operativo
                                        </h3>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-[#2f5f9f]" />
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {[
                                        ['1.248', 'Accesos hoy', '+12%'],
                                        ['18', 'Sedes activas', '100%'],
                                        ['96', 'Equipo', '+4'],
                                    ].map(([value, label, delta]) => (
                                        <div
                                            key={label}
                                            className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                                        >
                                            <p className="text-xl font-semibold">{value}</p>
                                            <p className="mt-1 text-xs text-white/55">{label}</p>
                                            <p className="mt-3 text-xs text-[#a8c3ee]">{delta}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Actividad semanal</span>
                                            <span className="text-white/55">Últimos 7 días</span>
                                        </div>
                                        <div className="mt-7 flex h-28 items-end gap-2">
                                            {[42, 58, 48, 75, 62, 88, 72].map((height, index) => (
                                                <div
                                                    key={index}
                                                    className="flex-1 rounded-t-md bg-[#6e98d4]"
                                                    style={{
                                                        height: `${height}%`,
                                                        opacity: 0.55 + index * 0.06,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                        <p className="text-xs">Estado de sedes</p>
                                        <div className="mx-auto mt-5 grid h-24 w-24 place-items-center rounded-full border-[10px] border-[#7fa7e6] border-r-white/10">
                                            <span className="text-lg font-bold">94%</span>
                                        </div>
                                        <p className="mt-4 text-center text-xs text-white/55">
                                            Operación saludable
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-reveal border-y border-white/8 bg-white/[0.025]">
                <div className="mx-auto grid max-w-7xl gap-8 px-5 py-7 sm:grid-cols-3 lg:px-8">
                    {metrics.map(([value, label]) => (
                        <div key={label} className="text-center">
                            <p className="text-2xl font-semibold text-[#a8c3ee]">{value}</p>
                            <p className="mt-1 text-sm text-white/45">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="producto" className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
                <div className="max-w-3xl">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a8c3ee]">
                        Una sola fuente de verdad
                    </p>
                    <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#f8fafc] sm:text-5xl">
                        La operación completa, sin saltar entre sistemas.
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-white/50">
                        Cada módulo comparte permisos, tenant y auditoría. Menos trabajo manual, más
                        contexto para decidir.
                    </p>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, text }) => (
                        <article
                            key={title}
                            className="landing-feature group rounded-[1.6rem] border border-white/8 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-[#7fa7e6]/40 hover:bg-[#7fa7e6]/[0.065]"
                        >
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#7fa7e6]/15 text-xl text-[#a8c3ee]">
                                <Icon />
                            </div>
                            <h3 className="mt-6 text-xl">{title}</h3>
                            <p className="mt-3 leading-7 text-white/45">{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="seguridad" className="landing-reveal mx-auto max-w-7xl px-5 pb-20 lg:px-8">
                <div className="overflow-hidden rounded-[2rem] border border-[#7fa7e6]/25 bg-[#111a22] p-8 sm:p-12">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#2f5f9f] text-2xl text-white">
                                <TbShieldCheck />
                            </div>
                            <h2 className="mt-7 text-4xl font-semibold tracking-[-0.04em]">
                                Seguridad integrada, no añadida al final.
                            </h2>
                            <p className="mt-5 max-w-xl leading-8 text-white/50">
                                Límites por tenant, rutas protegidas por rol, archivos privados,
                                tokens de un solo uso y un contrato de errores sin filtraciones
                                sensibles.
                            </p>
                        </div>
                        <div className="grid gap-3">
                            {[
                                'Aislamiento de datos por empresa',
                                'Auditoría de acciones administrativas',
                                'Invitaciones con expiración y token cifrado',
                                'Rate limiting y validación de archivos',
                                'Backups y migraciones reproducibles',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3"
                                >
                                    <TbCheck className="shrink-0 text-lg text-[#a8c3ee]" />
                                    <span className="text-sm text-white/70">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="planes" className="border-y border-white/8 bg-white/[0.018] py-20">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="landing-reveal text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a8c3ee]">
                            Planes transparentes
                        </p>
                        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                            Empieza pequeño. Escala sin rehacerlo todo.
                        </h2>
                    </div>
                    <div className="mt-10 grid gap-5 lg:grid-cols-3">
                        {plans.slice(0, 3).map((plan, index) => (
                            <article
                                key={plan.code}
                                className={`landing-feature relative rounded-[1.7rem] border p-7 ${
                                    index === 1
                                        ? 'border-[#7fa7e6]/60 bg-[#7fa7e6]/[0.09]'
                                        : 'border-white/8 bg-white/[0.03]'
                                }`}
                            >
                                {index === 1 ? (
                                    <span className="absolute right-5 top-5 rounded-full bg-[#b56a2b] px-3 py-1 text-xs font-bold text-white">
                                        Recomendado
                                    </span>
                                ) : null}
                                <h3 className="text-xl">{plan.name}</h3>
                                <p className="mt-3 min-h-14 text-sm leading-6 text-white/45">
                                    {plan.description}
                                </p>
                                <p className="mt-7 text-4xl font-semibold">
                                    USD {Math.round(plan.monthly_price_cents / 100)}
                                    <span className="text-sm font-normal text-white/35">
                                        {' '}
                                        / mes
                                    </span>
                                </p>
                                <ul className="mt-7 space-y-3 text-sm text-white/65">
                                    <li className="flex gap-2">
                                        <TbCheck className="text-[#a8c3ee]" />
                                        {plan.qty_locations} ubicaciones
                                    </li>
                                    <li className="flex gap-2">
                                        <TbCheck className="text-[#a8c3ee]" />
                                        {plan.qty_admins} administradores
                                    </li>
                                    <li className="flex gap-2">
                                        <TbCheck className="text-[#a8c3ee]" />
                                        {plan.qty_operators} operadores
                                    </li>
                                    <li className="flex gap-2">
                                        <TbCheck className="text-[#a8c3ee]" />
                                        {plan.qty_daily_reads.toLocaleString('es-CL')} accesos
                                        diarios
                                    </li>
                                </ul>
                                <Link
                                    className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-bold ${
                                        index === 1
                                            ? 'bg-[#2f5f9f] text-white'
                                            : 'border border-white/12 bg-white/5 text-white'
                                    }`}
                                    to="/start-trial"
                                >
                                    Probar 14 días
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="landing-reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
                <div className="rounded-[2rem] border border-[#7fa7e6]/25 bg-[#193a63] px-7 py-12 text-center text-white sm:px-12">
                    <TbLock className="mx-auto text-3xl" />
                    <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                        Tu operación merece algo mejor que planillas dispersas.
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-blue-100/80">
                        Crea tu empresa, invita al equipo y empieza a registrar la operación hoy. No
                        necesitas tarjeta.
                    </p>
                    <Link
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#081018] px-6 py-3.5 font-bold text-white"
                        to="/start-trial"
                    >
                        Crear mi espacio
                        <TbArrowUpRight />
                    </Link>
                </div>
            </section>

            <footer className="border-t border-white/8">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <div>
                        <p className="text-lg font-bold">locentr</p>
                        <p className="mt-1 text-sm text-white/35">
                            Diseñado y desarrollado por Boris Alvial.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            aria-label="GitHub de Boris Alvial"
                            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:border-[#7fa7e6]/60 hover:text-[#a8c3ee]"
                            href="https://github.com/NoisGit"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <TbBrandGithub />
                        </a>
                        <a
                            aria-label="LinkedIn de Boris Alvial"
                            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:border-[#7fa7e6]/60 hover:text-[#a8c3ee]"
                            href="https://www.linkedin.com/in/borisalvialv/"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <TbBrandLinkedin />
                        </a>
                        <a
                            aria-label="Instagram de Nois Deus"
                            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:border-[#7fa7e6]/60 hover:text-[#a8c3ee]"
                            href="https://www.instagram.com/nois.deus"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <TbBrandInstagram />
                        </a>
                    </div>
                </div>
            </footer>
        </main>
    )
}

export default Landing
