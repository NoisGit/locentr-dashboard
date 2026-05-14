import useCustomerList from '@/views/concepts/customers/CustomerList/hooks/useCustomerList'

const useUsersList = () => {
  const usersListState = useCustomerList()

  return {
    ...usersListState,
    usersList: usersListState.customerList,
    usersListTotal: usersListState.customerListTotal,
    selectedUsers: usersListState.selectedCustomer,
    setSelectedUser: usersListState.setSelectedCustomer,
    setSelectAllUsers: usersListState.setSelectAllCustomer,
  }
}

export default useUsersList
