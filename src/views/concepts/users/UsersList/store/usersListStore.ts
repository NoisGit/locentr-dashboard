import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Filter, User } from '../types'

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: {
    order: '',
    key: '',
  },
}

export const initialFilterData = {
  query: '',
  purchasedProducts: '',
  purchaseChannel: [
    'Retail Stores',
    'Online Retailers',
    'Resellers',
    'Mobile Apps',
    'Direct Sales',
  ],
}

export type UsersListState = {
  tableData: TableQueries
  filterData: Filter
  selectedUsers: Partial<User>[]
}

type UsersListAction = {
  setFilterData: (payload: Filter) => void
  setTableData: (payload: TableQueries) => void
  setSelectedUser: (checked: boolean, user: User) => void
  setSelectAllUsers: (users: User[]) => void
}

const initialState: UsersListState = {
  tableData: initialTableData,
  filterData: initialFilterData as unknown as Filter,
  selectedUsers: [],
}

export const useUsersListStore = create<
  UsersListState & UsersListAction
>((set) => ({
  ...initialState,
  setFilterData: (payload) => set(() => ({ filterData: payload })),
  setTableData: (payload) => set(() => ({ tableData: payload })),
  setSelectedUser: (checked, row) =>
    set((state) => {
      const prevData = state.selectedUsers
      if (checked) {
        return { selectedUsers: [...prevData, row] }
      }

      if (prevData.some((prevUser) => row.id === prevUser.id)) {
        return {
          selectedUsers: prevData.filter(
            (prevUser) => prevUser.id !== row.id,
          ),
        }
      }

      return { selectedUsers: prevData }
    }),
  setSelectAllUsers: (row) => set(() => ({ selectedUsers: row })),
}))
