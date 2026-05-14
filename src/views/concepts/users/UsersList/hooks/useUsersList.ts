import useCustomerList from '@/views/concepts/customers/CustomerList/hooks/useCustomerList'

const useUsersList = () => {
  const usersListState = useCustomerList()

  return usersListState
}

export default useUsersList
