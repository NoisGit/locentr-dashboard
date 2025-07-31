import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useManageHelpStore } from '../store/manageHelpStore'
import useManageHelp from '../hooks/useManageHelp'
import { Link } from 'react-router-dom'

import type { TableQueries } from '@/@types/common'
import type { HelpTicket } from '../types'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'

const HelpListTable = () => {
    const tableData = useManageHelpStore((state) => state.tableData)
    const selectedTicket = useManageHelpStore((state) => state.selectedTicket)
    const setSelectedTicket = useManageHelpStore((state) => state.setSelectedTicket)
    const setSelectAllTickets = useManageHelpStore((state) => state.setSelectAllTickets)
    const setTableData = useManageHelpStore((state) => state.setTableData)

    const { helpList, helpTotal, isLoading } = useManageHelp()

    const columns: ColumnDef<HelpTicket>[] = useMemo(
        () => [
            {
                header: 'Subject',
                accessorKey: 'subject',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Link
                            to={`/concepts/help/help-details/${row.id}`}
                            className="font-bold heading-text hover:text-primary"
                        >
                            {row.subject || 'No subject'}
                        </Link>
                    )
                },
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: (props) => props.row.original.email || 'no-email@mail.com',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = props.row.original.status
                    const color =
                        status === 'resolved'
                            ? 'green'
                            : status === 'in_progress'
                            ? 'orange'
                            : 'red'
                    return <Tag color={color}>{status}</Tag>
                },
            },
            {
                header: 'Last update',
                accessorKey: 'updateTime',
                cell: (props) => props.row.original.updateTime ?? 'N/A',
            },
        ],
        []
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedTicket.length > 0) {
            setSelectAllTickets([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = { ...tableData, pageIndex: page }
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = { ...tableData, pageSize: Number(value), pageIndex: 1 }
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = { ...tableData, sort }
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: HelpTicket) => {
        setSelectedTicket(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<HelpTicket>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllTickets(originalRows)
        } else {
            setSelectAllTickets([])
        }
    }

    return (
        <div>
            <DataTable
                selectable
                hoverable={false}
                columns={columns}
                data={helpList}
                noData={!isLoading && helpList.length === 0}
                loading={isLoading}
                pagingData={{
                    total: helpTotal,
                    pageIndex: tableData.pageIndex,
                    pageSize: tableData.pageSize,
                }}
                checkboxChecked={(row) =>
                    selectedTicket.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </div>
    )
}

export default HelpListTable
