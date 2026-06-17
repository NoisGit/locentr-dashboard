import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AuthorityGuard from '@/components/route/AuthorityGuard'
import { Role } from '@/utils/rbac/types'

describe('AuthorityGuard', () => {
    it('renders protected content for an allowed role', () => {
        render(
            <MemoryRouter>
                <AuthorityGuard userAuthority={{ role: Role.ADMIN }} roles={[Role.ADMIN]}>
                    <div>Contenido privado</div>
                </AuthorityGuard>
            </MemoryRouter>,
        )

        expect(screen.getByText('Contenido privado')).toBeInTheDocument()
    })

    it('shows access denied for forbidden roles', () => {
        render(
            <MemoryRouter>
                <AuthorityGuard userAuthority={{ role: Role.CLIENT }} roles={[Role.SUPERADMIN]}>
                    <div>Auditoría</div>
                </AuthorityGuard>
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: '¡Acceso Denegado!' })).toBeInTheDocument()
        expect(screen.queryByText('Auditoría')).not.toBeInTheDocument()
    })
})
