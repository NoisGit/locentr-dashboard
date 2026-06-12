import { describe, expect, it } from 'vitest'
import { CSV_UPLOAD_MAX_BYTES, validateCsvUpload } from '@/utils/security/files'

describe('CSV upload validation', () => {
    it('accepts a non-empty CSV file', () => {
        const file = new File(['id_number;full_name'], 'personas.csv', {
            type: 'text/csv',
        })

        expect(validateCsvUpload(file)).toBeNull()
    })

    it('rejects unsupported extensions and MIME types', () => {
        const extension = new File(['data'], 'personas.xlsx', {
            type: 'application/vnd.ms-excel',
        })
        const mime = new File(['data'], 'personas.csv', {
            type: 'application/json',
        })

        expect(validateCsvUpload(extension)).toContain('.csv')
        expect(validateCsvUpload(mime)).toContain('tipo de archivo')
    })

    it('rejects empty and oversized files', () => {
        const empty = new File([], 'personas.csv', { type: 'text/csv' })
        const oversized = {
            name: 'personas.csv',
            size: CSV_UPLOAD_MAX_BYTES + 1,
            type: 'text/csv',
        } as File

        expect(validateCsvUpload(empty)).toContain('vacío')
        expect(validateCsvUpload(oversized)).toContain('5 MB')
    })
})
