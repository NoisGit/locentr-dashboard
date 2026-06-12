import appConfig from '@/configs/app.config'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import i18n from 'i18next'
import { dateLocales } from '@/locales'
import dayjs from 'dayjs'

type LocaleState = {
    currentLang: string
    setLang: (payload: string) => void
}

export const useLocaleStore = create<LocaleState>()(
    devtools(
        persist(
            (set) => ({
                currentLang: appConfig.locale,
                setLang: () => {
                    i18n.changeLanguage(appConfig.locale)

                    dateLocales[appConfig.locale]().then(() => {
                        dayjs.locale(appConfig.locale)
                    })

                    return set({ currentLang: appConfig.locale })
                },
            }),
            {
                name: 'locale',
                merge: (_persisted, current) => ({
                    ...current,
                    currentLang: appConfig.locale,
                }),
            },
        ),
    ),
)
