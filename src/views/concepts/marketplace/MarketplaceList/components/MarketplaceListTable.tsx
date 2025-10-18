import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Progress from '@/components/ui/Progress'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import useMarketplaceList from '../hooks/useMarketplaceList'
import classNames from '@/utils/classNames'
import cloneDeep from 'lodash/cloneDeep'
import { useNavigate } from 'react-router'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { FiPackage } from 'react-icons/fi'
import { NumericFormat } from 'react-number-format'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { MarketplaceItem } from '../types'
import type { TableQueries } from '@/@types/common'

const MarketplaceColumn = ({ row }: { row: MarketplaceItem }) => {
    return (
        <div className="flex items-center gap-2">
            <Avatar
                shape="round"
                size={60}
                {...(row.img ? { src: row.img } : { icon: <FiPackage /> })}
            />
            <div>
                <div className="font-bold heading-text mb-1">{row.name}</div>
                <span>ID: {row.productCode}</span>
            </div>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: () => void
    onDelete: () => void
}) => {
    return (
        <div className="flex items-center justify-end gap-3">
            <Tooltip title="Edit">
                <div
                    className="text-xl cursor-pointer select-none font-semibold"
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title="Delete">
                <div
                    className="text-xl cursor-pointer select-none font-semibold"
                    role="button"
                    onClick={onDelete}
                >
                    <TbTrash />
                </div>
            </Tooltip>
        </div>
    )
}

const MarketplaceListTable = () => {
    const navigate = useNavigate()
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [toDeleteId, setToDeleteId] = useState('')

    const {
        marketplaceList,
        setMarketplaceList,
        marketplaceListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllMarketplace,
        setSelectedMarketplaceItem,
        selectedMarketplaceItem,
    } = useMarketplaceList()

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleDelete = (item: MarketplaceItem) => {
        setDeleteConfirmationOpen(true)
        setToDeleteId(item.id)
    }

    const handleEdit = (item: MarketplaceItem) => {
        navigate(`/concepts/marketplace/marketplace-edit/${item.id}`)
    }

    // <--- ELIMINA DEL STORE CON ZUSTAND:
    const handleConfirmDelete = () => {
        const newMarketplaceList = marketplaceList.filter(
            (item) => item.id !== toDeleteId
        )
        setMarketplaceList(newMarketplaceList)
        setSelectAllMarketplace([])
        setDeleteConfirmationOpen(false)
        setToDeleteId('')
    }

    const columns: ColumnDef<MarketplaceItem>[] = useMemo(
        () => [
            {
                header: 'Marketplace Item',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <MarketplaceColumn row={row} />
                },
            },
            {
                header: 'Price',
                accessorKey: 'price',
                cell: (props) => {
                    const { price } = props.row.original
                    return (
                        <span className="font-bold heading-text">
                            <NumericFormat
                                fixedDecimalScale
                                prefix="$"
                                displayType="text"
                                value={price}
                                decimalScale={2}
                                thousandSeparator={true}
                            />
                        </span>
                    )
                },
            },
            {
                header: 'Quantity',
                accessorKey: 'stock',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="font-bold heading-text">
                            {row.stock}
                        </span>
                    )
                },
            },
            {
                header: 'Sales',
                accessorKey: 'status',
                cell: (props) => {
                    const { salesPercentage, sales } = props.row.original
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="flex gap-1">
                                <span className="font-semibold">
                                    <NumericFormat
                                        displayType="text"
                                        value={sales}
                                        thousandSeparator={true}
                                    />
                                </span>
                                <span>Sales</span>
                            </span>
                            <Progress
                                percent={salesPercentage}
                                showInfo={false}
                                customColorClass={classNames(
                                    'bg-error',
                                    salesPercentage > 40 && 'bg-warning',
                                    salesPercentage > 70 && 'bg-success',
                                )}
                            />
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleDelete(props.row.original)}
                    />
                ),
            },
        ],
        []
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedMarketplaceItem.length > 0) {
            setSelectAllMarketplace([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: MarketplaceItem) => {
        setSelectedMarketplaceItem(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<MarketplaceItem>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllMarketplace(originalRows)
        } else {
            setSelectAllMarketplace([])
        }
    }

    return (
        <>
            <DataTable
                selectable
                columns={columns}
                data={marketplaceList}
                noData={!isLoading && marketplaceList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: marketplaceListTotal,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedMarketplaceItem.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
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
                    Are you sure you want to remove this marketplace item? This action
                    can&apos;t be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default MarketplaceListTable
