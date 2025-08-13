// src/views/concepts/users/CustomerCreate.tsx
import { useState } from 'react'
import CustomerForm, { type CustomerFormSchema } from '../CustomerForm'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router'
import ApiService from '@/services/ApiService'

const CustomerCreate = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: CustomerFormSchema) => {
    try {
      setIsSubmitting(true)

      await ApiService.fetchDataWithAxios({
        url: '/api/v1/users/',         
        method: 'post',
        data: {
          full_name: values.fullName?.trim(),
          phone: values.phone?.trim(),
          email: values.email?.trim(),
          password: values.password,
          role_id: Number(values.roleId),
        },
      })

      toast.push(<Notification type="success">User created!</Notification>, {
        placement: 'top-center',
      })
      navigate('/concepts/users/users-list')
    } catch (err: unknown) {
      const anyErr = err as any
      const msg =
        anyErr?.response?.data?.message ||
        anyErr?.response?.data?.detail ||
        'Could not create the user.'
      toast.push(<Notification type="danger">{msg}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    navigate('/concepts/users/users-list')
  }

  return (
    <CustomerForm
      newCustomer
      submitting={isSubmitting}
      defaultValues={{ fullName: '', phone: '', email: '', password: '', roleId: '' }}
      onFormSubmit={handleFormSubmit}
      onDiscard={handleDiscard}
    />
  )
}

export default CustomerCreate
