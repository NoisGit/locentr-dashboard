import { z } from 'zod'

export const VALIDATION_MESSAGES = {
    required: (field: string) => `${field} es obligatorio`,
    maxLength: (field: string, max: number) =>
        `${field} no puede superar ${max} caracteres`,
    email: 'Ingresa un correo válido',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
} as const

export function requiredText(field: string, maxLength = 255) {
    return z
        .string()
        .trim()
        .min(1, { message: VALIDATION_MESSAGES.required(field) })
        .max(maxLength, {
            message: VALIDATION_MESSAGES.maxLength(field, maxLength),
        })
}

export function optionalText(field: string, maxLength = 255) {
    return z
        .string()
        .trim()
        .max(maxLength, {
            message: VALIDATION_MESSAGES.maxLength(field, maxLength),
        })
        .optional()
}

export const emailSchema = requiredText('El correo', 254).email({
    message: VALIDATION_MESSAGES.email,
})

export const passwordSchema = z
    .string()
    .min(8, { message: VALIDATION_MESSAGES.passwordMin })
    .max(128, {
        message: VALIDATION_MESSAGES.maxLength('La contraseña', 128),
    })

export const usernameSchema = requiredText('El usuario', 40)
    .min(3, { message: 'El usuario debe tener al menos 3 caracteres' })
    .regex(/^[a-z0-9._-]+$/, {
        message: 'Usa solo minúsculas, números, punto, guion o guion bajo',
    })

export const roleSchema = requiredText('El rol', 30)

export function otpSchema(length = 6) {
    return z
        .string()
        .length(length, { message: `Ingresa el código de ${length} dígitos` })
        .regex(/^\d+$/, { message: 'El código solo puede contener números' })
}
