// src/components/template/UserDropdown.tsx
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router'
import {
    PiUserDuotone,
    PiGearDuotone,
    PiPulseDuotone,
    PiSignOutDuotone,
    PiQuestionDuotone,
} from 'react-icons/pi'
import { useAuth } from '@/auth'
import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
    {
        label: 'Account Setting',
        path: '/concepts/account/settings',
        icon: <PiGearDuotone />,
    },
    {
        label: 'Activity Log',
        path: '/concepts/account/activity-log',
        icon: <PiPulseDuotone />,
    },
    {
        label: 'Help',
        path: '/concepts/help/manage-help',
        icon: <PiQuestionDuotone />,
    },
]

const _UserDropdown = () => {
    // Tomamos el objeto completo y aplicamos fallbacks por si el backend usa otras keys
    const u = useSessionUser((state) => state.user) as any

    const displayName =
        u?.userName ||
        u?.name ||
        u?.fullName ||
        u?.full_name ||
        [u?.firstName || u?.first_name, u?.lastName || u?.last_name]
            .filter(Boolean)
            .join(' ') ||
        'Anonymous'

    const displayEmail =
        u?.email ||
        u?.email_address ||
        u?.mail ||
        ''

    const avatarSrc =
        u?.avatar ||
        u?.avatar_url ||
        u?.photoURL ||
        u?.photo_url

    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
    }

    const avatarProps = avatarSrc
        ? { src: avatarSrc }
        : { icon: <PiUserDuotone /> }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {displayName}
                        </div>
                        <div className="text-xs">
                            {displayEmail || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)
export default UserDropdown
