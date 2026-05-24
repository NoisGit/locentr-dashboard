// src/components/template/Header/Notification/Notification.tsx

import withHeaderItem from '@/utils/hoc/withHeaderItem'

/**
 * 🔕 Notificaciones ocultas por ahora.
 * - Dejamos el componente como un stub que no renderiza nada.
 * - El contenido original queda abajo comentado para reactivarlo cuando quieras.
 *   (solo descomenta y vuelve a exportar ese componente).
 */

const _Notification = () => null

const Notification = withHeaderItem(_Notification)
export default Notification

/* ===================== CONTENIDO ORIGINAL (COMENTADO) =====================

import { useState, useRef } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen } from 'react-icons/hi'
import { apiGetNotificationList } from '@/services/CommonService'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'

import type { DropdownRef } from '@/components/ui/Dropdown'

type NotificationList = {
  id: string
  target: string
  description: string
  date: string
  image: string
  type: number
  location: string
  locationLabel: string
  status: string
  readed: boolean
}

const notificationHeight = 'h-[280px]'

const _Notification = ({ className }: { className?: string }) => {
  const [notificationList, setNotificationList] = useState<NotificationList[]>([])
  const [unreadNotification, setUnreadNotification] = useState(false)
  const [noResult, setNoResult] = useState(false)
  const [loading, setLoading] = useState(false)

  const { larger } = useResponsive()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { authenticated } = useAuth()

  const notificationDropdownRef = useRef<DropdownRef>(null)

  const onNotificationOpen = async () => {
    const onAuthRoute = pathname.startsWith('/auth')
    if (!authenticated || onAuthRoute) return

    if (notificationList.length === 0) {
      setLoading(true)
      try {
        const resp = await apiGetNotificationList()
        const list: NotificationList[] = Array.isArray(resp)
          ? resp
          : (resp as any)?.data ?? []

        setNotificationList(list)
        setUnreadNotification(list.some((n) => !n.readed))
        setNoResult(list.length === 0)
      } finally {
        setLoading(false)
      }
    }
  }

============================================================================ */
