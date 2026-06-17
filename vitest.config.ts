import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        exclude: ['tests/e2e/**', 'node_modules/**', 'build/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'src/components/route/AuthorityGuard.tsx',
                'src/services/axios/*.ts',
                'src/store/authStore.ts',
                'src/store/companies/CompaniesStore.ts',
                'src/utils/apiError.ts',
                'src/utils/rbac/**/*.ts',
                'src/utils/security/files.ts',
                'src/utils/validation/schemas.ts',
                'src/views/billing/subscriptionStatus.ts',
                'src/views/dashboard/onboardingModel.ts',
            ],
            thresholds: {
                statements: 70,
            },
        },
    },
})
