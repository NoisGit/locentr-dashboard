// src/views/concepts/news/ManageArticle/components/ArticleListTable.tsx
import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useManageArticleStore } from '../store/manageArticleStore'
import useManageArticle from '../hooks/useManageArticle'
import { HiOutlinePencil } from 'react-icons/hi'
import { Link } from 'react-router-dom' // sólo para el lápiz

import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Article } from '../types'

const ArticleListTable = () => {
  const tableData = useManageArticleStore((s) => s.tableData)
  const selectedArticle = useManageArticleStore((s) => s.selectedArticle)
  const setSelectedArticle = useManageArticleStore((s) => s.setSelectedArticle)
  const setSelectAllArticle = useManageArticleStore((s) => s.setSelectAllArticle)
  const setTableData = useManageArticleStore((s) => s.setTableData)

  const { articleList, articleTotal, isLoading } = useManageArticle()

  const columns: ColumnDef<Article>[] = useMemo(
    () => [
      {
        header: 'Título',
        accessorKey: 'title',
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <div className="mb-1 leading-snug">
                  <span className="font-bold heading-text break-words">{row.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {(row.tags || []).map((tag) => (
                    <Tag key={tag.id}>{tag.label}</Tag>
                  ))}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Autor',
        accessorKey: 'authors',
        enableSorting: false,
        cell: (props) => {
          const r = props.row.original as unknown as Record<string, unknown>
          const a =
            (typeof r['author'] === 'string' && (r['author'] as string)) ||
            (typeof r['author_name'] === 'string' && (r['author_name'] as string)) ||
            ''
          return <span className="truncate">{a || '—'}</span>
        },
      },
      {
        header: 'Última actualización',
        accessorKey: 'updateTimeStamp',
        cell: (props) => <div>{props.row.original.updateTime || '—'}</div>,
      },
      {
        header: '',
        id: 'action',
        enableSorting: false,
        cell: (props) => {
          const row = props.row.original
          const id = String((row as unknown as { id?: string | number }).id ?? '').trim()
          return (
            <div className="text-right pr-2">
              {id ? (
                <Link
                  to={`/concepts/news/edit-article/${id}`}
                  className="text-xl text-gray-500 hover:text-primary"
                  title="Editar noticia"
                >
                  <HiOutlinePencil />
                </Link>
              ) : (
                <span className="text-xl text-gray-300" title="Sin ID para editar">
                  <HiOutlinePencil />
                </span>
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedArticle.length > 0) setSelectAllArticle([])
  }

  const handlePaginationChange = (page: number) => {
    const next = structuredClone(tableData)
    next.pageIndex = page
    handleSetTableData(next)
  }

  const handleSelectChange = (value: number) => {
    const next = structuredClone(tableData)
    next.pageSize = Number(value)
    next.pageIndex = 1
    handleSetTableData(next)
  }

  const handleSort = (sort: OnSortParam) => {
    const next = structuredClone(tableData)
    next.sort = sort
    handleSetTableData(next)
  }

  const handleRowSelect = (checked: boolean, row: Article) => setSelectedArticle(checked, row)

  const handleAllRowSelect = (checked: boolean, rows: Row<Article>[]) => {
    if (checked) setSelectAllArticle(rows.map((r) => r.original))
    else setSelectAllArticle([])
  }

  return (
    <DataTable
      selectable
      hoverable={false}
      columns={columns}
      data={articleList}
      noData={!isLoading && articleList.length === 0}
      skeletonAvatarColumns={[]}
      loading={isLoading}
      pagingData={{
        total: articleTotal || 0,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) => selectedArticle.some((s) => s.id === row.id)}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default ArticleListTable
