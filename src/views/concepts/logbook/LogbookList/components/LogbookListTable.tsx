import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import useLogbookList from '../hooks/useLogbookList'
import classNames from '@/utils/classNames'
import cloneDeep from 'lodash/cloneDeep'
import { useNavigate } from 'react-router'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { FiPackage } from 'react-icons/fi'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { LogbookItem } from '../types'
import type { TableQueries } from '@/@types/common'

const LogbookColumn = ({ row }: { row: LogbookItem }) => {
    return (
        <div className="flex items-center gap-2">
            <Avatar
                shape="round"
                size={60}
                {...(row.img ? { src: row.img } : { icon: <FiPackage /> })}
            />
            <div>
                <div className="font-bold heading-text mb-1">{row.title}</div>
                <span>ID: {row.id}</span>
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
}) => (
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

const LogbookListTable = () => {
    const navigate = useNavigate()
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [toDeleteId, setToDeleteId] = useState('')

    const {
        logbookList,
        setLogbookList,
        logbookListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllLogbook,
        setSelectedLogbookItem,
        selectedLogbookItem,
    } = useLogbookList()

    const handleCancel = () => setDeleteConfirmationOpen(false)

    const handleDelete = (item: LogbookItem) => {
        setDeleteConfirmationOpen(true)
        setToDeleteId(item.id)
    }

    const handleEdit = (item: LogbookItem) => {
        navigate(`/concepts/logbook/logbook-edit/${item.id}`)
    }

    const handleConfirmDelete = () => {
        const newLogbookList = logbookList.filter(
            (item) => item.id !== toDeleteId
        )
        setLogbookList(newLogbookList)
        setSelectAllLogbook([])
        setDeleteConfirmationOpen(false)
        setToDeleteId('')
    }

    const columns: ColumnDef<LogbookItem>[] = useMemo(
        () => [
            {
                header: 'Logbook Item',
                accessorKey: 'title',
                cell: (props) => <LogbookColumn row={props.row.original} />,
            },
            {
                header: 'Responsible',
                accessorKey: 'responsible',
                cell: (props) => {
                    const { responsible } = props.row.original
                    return <span className="font-bold heading-text">{responsible}</span>
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const { date } = props.row.original
                    return <span className="font-bold heading-text">{date}</span>
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    return <span className="font-bold heading-text">{status}</span>
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
        if (selectedLogbookItem.length > 0) {
            setSelectAllLogbook([])
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

    const handleRowSelect = (checked: boolean, row: LogbookItem) => {
        setSelectedLogbookItem(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<LogbookItem>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllLogbook(originalRows)
        } else {
            setSelectAllLogbook([])
        }
    }

    return (
        <>
            <DataTable
                selectable
                columns={columns}
                data={logbookList}
                noData={!isLoading && logbookList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: logbookListTotal,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedLogbookItem.some((selected) => selected.id === row.id)
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
                title="Remove logbook item"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>
                    Are you sure you want to remove this logbook item? This action
                    can't be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default LogbookListTable
