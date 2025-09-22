// src/views/concepts/news/ManageArticle/store/manageArticleStore.ts
import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Article } from '../types'

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: { key: '', order: '' },
}

export type Filter = {
  category?: string[]
  query?: string
}

export const initialFilterData: Filter = {
  category: [
    'introduction',
    'setupGuide',
    'basicFeatures',
    'survey',
    'analytic',
    'dataVisualization',
    'chatbot',
    'media',
    'security',
    'integration',
    'themes',
    'commission',
  ],
}

export type ManageArticleState = {
  tableData: TableQueries
  filterData: Filter
  selectedArticle: Partial<Article>[]
}

type ManageArticleAction = {
  setFilterData: (payload: Filter) => void
  setTableData: (payload: TableQueries) => void
  setSelectedArticle: (checked: boolean, row: Article) => void
  setSelectAllArticle: (rows: Article[]) => void
  clearSelection: () => void
  resetFilters: () => void
}

const initialState: ManageArticleState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedArticle: [],
}

export const useManageArticleStore = create<ManageArticleState & ManageArticleAction>((set) => ({
  ...initialState,

  setFilterData: (payload) => set(() => ({ filterData: payload })),

  setTableData: (payload) => set(() => ({ tableData: payload })),

  setSelectedArticle: (checked, row) =>
    set((state) => {
      const exists = state.selectedArticle.some((a) => a.id === row.id)
      if (checked && !exists) return { selectedArticle: [...state.selectedArticle, row] }
      if (!checked && exists) return { selectedArticle: state.selectedArticle.filter((a) => a.id !== row.id) }
      return { selectedArticle: state.selectedArticle }
    }),

  setSelectAllArticle: (rows) => set(() => ({ selectedArticle: rows })),
  clearSelection: () => set(() => ({ selectedArticle: [] })),
  resetFilters: () => set(() => ({ filterData: initialFilterData })),
}))
