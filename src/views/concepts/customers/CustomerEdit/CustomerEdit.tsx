// src/views/concepts/customers/CustomerEdit/CustomerEdit.tsx
import { useState, useMemo } from 'react'
import CustomerForm, { type CustomerFormSchema } from '../CustomerForm'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useParams, useNavigate } from 'react-router'
import useSWR from 'swr'
import {
  apiGetCustomerById,
  apiUpdateCustomer,
} from '@/services/CustomersService'

type AnyUser = Record<string, any>

const CustomerEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const numericId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])

  const { data, isLoading, mutate } = useSWR(
    numericId ? ['/api/users/:id', numericId] : null,
    ([, theId]) => apiGetCustomerById(theId as string),
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const getDefaultValues = (): Partial<CustomerFormSchema> => {
    const u = (data || {}) as AnyUser
    const fullName =
      u.full_name ||
      u.name ||
      [u.first_name, u.last_name].filter(Boolean).join(' ')
    return {
      fullName: fullName || '',
      phone: u.phone || u.phone_number || '',
      email: u.email || '',
      roleId: (u.role_id ?? u.role?.id) ?? '',
      oldPassword: '',
      newPassword: '',
    }
  }

  const defaults = useMemo(() => getDefaultValues(), [data])
  const formKey = useMemo(
    () => `edit-${numericId}-${data?.id ?? 'none'}-${data?.email ?? ''}`,
    [numericId, data?.id, data?.email]
  )

  const handleFormSubmit = async (values: CustomerFormSchema) => {
    if (!numericId) return
    try {
      setIsSubmitting(true)

      const patch: Record<string, unknown> = {
        full_name: values.fullName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        role_id: values.roleId ? Number(values.roleId) : undefined,
      }

      if (values.newPassword && values.newPassword.trim().length >= 6) {
        patch.password = values.newPassword
      }

      Object.keys(patch).forEach((k) => {
        if (patch[k] === '' || patch[k] === undefined) delete patch[k]
      })

      await apiUpdateCustomer(numericId, patch)
      toast.push(<Notification type="success">Changes saved!</Notification>, {
        placement: 'top-center',
      })
      await mutate()
      navigate('/concepts/users/users-list')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Could not save changes.'
      toast.push(<Notification type="danger">{msg}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    toast.push(<Notification type="info">Changes discarded!</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/users/users-list')
  }

  if (!isLoading && !data) {
    return null
  }

  return (
    <CustomerForm
      key={formKey}
      mode="edit"
      submitLabel="Edit"
      submitting={isSubmitting}
      defaultValues={defaults}
      onFormSubmit={handleFormSubmit}
      onDiscard={handleDiscard}
    />
  )
}

export default CustomerEdit
