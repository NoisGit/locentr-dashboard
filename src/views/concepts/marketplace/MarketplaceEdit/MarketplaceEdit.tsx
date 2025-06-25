import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import MarketplaceForm from '../MarketplaceForm'
import NoProductFound from '@/assets/svg/NoProductFound'
import sleep from '@/utils/sleep'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router'
import type { MarketplaceFormSchema, MarketplaceItem } from '../types'
import { marketplaceData } from '@/mock/data/marketplaceData' // Ajusta la ruta si es necesario

const MarketplaceEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // --- Cambio aquí: busca localmente el item ---
    const [data, setData] = useState<MarketplaceItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const found = marketplaceData.find((item) => item.id === id)
        setData(found || null)
        setIsLoading(false)
    }, [id])

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [isSubmiting, setIsSubmiting] = useState(false)

    const getDefaultValues = () => {
        if (data) {
            const {
                name,
                description,
                productCode,
                taxRate,
                price,
                bulkDiscountPrice,
                costPerItem,
                imgList,
                category,
                tags,
                brand,
            } = data

            return {
                name,
                description,
                productCode,
                taxRate,
                price,
                bulkDiscountPrice,
                costPerItem,
                imgList,
                category,
                tags: tags?.length
                    ? tags.map((t) => ({ label: t, value: t }))
                    : [],
                brand,
            }
        }
        return {}
    }

    const handleFormSubmit = async (values: MarketplaceFormSchema) => {
        // Simula un "guardar"
        console.log('Submitted values', values)
        setIsSubmiting(true)
        await sleep(800)
        setIsSubmiting(false)
        toast.push(<Notification type="success">Changes Saved!</Notification>, {
            placement: 'top-center',
        })
        navigate('/concepts/marketplace/marketplace-list')
    }

    const handleDelete = () => setDeleteConfirmationOpen(true)
    const handleCancel = () => setDeleteConfirmationOpen(false)
    const handleBack = () => navigate('/concepts/marketplace/marketplace-list')

    const handleConfirmDelete = () => {
        setDeleteConfirmationOpen(false)
        toast.push(
            <Notification type="success">Marketplace item deleted!</Notification>,
            { placement: 'top-center' }
        )
        navigate('/concepts/marketplace/marketplace-list')
    }

    return (
        <>
            {!isLoading && !data && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoProductFound height={280} width={280} />
                    <h3 className="mt-8">No marketplace item found!</h3>
                </div>
            )}
            {!isLoading && data && (
                <>
                    <MarketplaceForm
                        defaultValues={getDefaultValues() as MarketplaceFormSchema}
                        newMarketplace={false}
                        onFormSubmit={handleFormSubmit}
                    >
                        <Container>
                            <div className="flex items-center justify-between px-8">
                                <Button
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    variant="plain"
                                    icon={<TbArrowNarrowLeft />}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <div className="flex items-center">
                                    <Button
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        customColorClass={() =>
                                            'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                        }
                                        icon={<TbTrash />}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmiting}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </MarketplaceForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="Remove marketplace item"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            Are you sure you want to remove this item? This
                            action can&apos;t be undone.
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default MarketplaceEdit
