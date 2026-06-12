import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './lang/es.json'
import appConfig from '@/configs/app.config'

const resources = {
    es: { translation: es },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: appConfig.locale,
    lng: appConfig.locale,
    interpolation: {
        escapeValue: false,
    },
})

export const dateLocales: {
    [key: string]: () => Promise<ILocale>
} = {
    es: () => import('dayjs/locale/es'),
}

export default i18n
