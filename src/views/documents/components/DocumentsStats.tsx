import Card from '@/components/ui/Card'
import { formatFileSize } from '../utils'

type DocumentsStatsProps = {
    total: number
    visible: number
    totalSize: number
}

const DocumentsStats = ({ total, visible, totalSize }: DocumentsStatsProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total de documentos</div>
                <div className="mt-2 text-2xl font-semibold">{total}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Visibles ahora</div>
                <div className="mt-2 text-2xl font-semibold">{visible}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tamaño visible</div>
                <div className="mt-2 text-2xl font-semibold">{formatFileSize(totalSize)}</div>
            </Card>
        </div>
    )
}

export default DocumentsStats
