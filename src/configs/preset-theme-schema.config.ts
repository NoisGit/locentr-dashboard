export type Variables =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'neutral'

export type ThemeVariables = Record<'light' | 'dark', Record<Variables, string>>

const defaultTheme: ThemeVariables = {
    light: {
        primary: '#2a85ff',
        primaryDeep: '#0069f6',
        primaryMild: '#4996ff',
        primarySubtle: '#2a85ff1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#2a85ff',
        primaryDeep: '#0069f6',
        primaryMild: '#4996ff',
        primarySubtle: '#2a85ff1a',
        neutral: '#ffffff',
    },
}

const darkTheme: ThemeVariables = {
    light: {
        primary: '#18181b',
        primaryDeep: '#09090b',
        primaryMild: '#27272a',
        primarySubtle: '#18181b0d',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#ffffff',
        primaryDeep: '#09090b',
        primaryMild: '#e5e7eb',
        primarySubtle: '#ffffff1a',
        neutral: '#111827',
    },
}

const greenTheme: ThemeVariables = {
    light: {
        primary: '#0CAF60',
        primaryDeep: '#088d50',
        primaryMild: '#34c779',
        primarySubtle: '#0CAF601a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#0CAF60',
        primaryDeep: '#088d50',
        primaryMild: '#34c779',
        primarySubtle: '#0CAF601a',
        neutral: '#ffffff',
    },
}

const purpleTheme: ThemeVariables = {
    light: {
        primary: '#7C3AED',
        primaryDeep: '#5B21B6',
        primaryMild: '#8B5CF6',
        primarySubtle: '#7C3AED18',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#A78BFA',
        primaryDeep: '#8B5CF6',
        primaryMild: '#C4B5FD',
        primarySubtle: '#A78BFA20',
        neutral: '#ffffff',
    },
}

const orangeTheme: ThemeVariables = {
    light: {
        primary: '#fb732c',
        primaryDeep: '#cc5c24',
        primaryMild: '#fc8f56',
        primarySubtle: '#fb732c1a',
        neutral: '#ffffff',
    },
    dark: {
        primary: '#fb732c',
        primaryDeep: '#cc5c24',
        primaryMild: '#fc8f56',
        primarySubtle: '#fb732c1a',
        neutral: '#ffffff',
    },
}

const locentrTheme: ThemeVariables = {
    light: {
        primary: '#2F5F9F',
        primaryDeep: '#193A63',
        primaryMild: '#4F7FBD',
        primarySubtle: '#2F5F9F18',
        neutral: '#FFFFFF',
    },
    dark: {
        primary: '#7FA7E6',
        primaryDeep: '#4F7FBD',
        primaryMild: '#A8C3EE',
        primarySubtle: '#7FA7E620',
        neutral: '#FFFFFF',
    },
}

const presetThemeSchemaConfig: Record<string, ThemeVariables> = {
    default: defaultTheme,
    locentr: locentrTheme,
    dark: darkTheme,
    green: greenTheme,
    purple: purpleTheme,
    orange: orangeTheme,
}

export default presetThemeSchemaConfig
