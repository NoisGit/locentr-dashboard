import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import { getLocentrRoleLabel } from '@/utils/rbac'

const UserProfileDropdownContent = () => {
    const user = useSessionUser((state) => state.user)

    const displayName =
        user?.userName ||
        user?.full_name ||
        'Usuario'

    const displayEmail = user?.email || ''
    const displayRole = user?.locentrRoleLabel || getLocentrRoleLabel(user?.role)
    const avatarSrc = user?.avatar || ''

    const { signOut } = useAuth()

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
                            {displayEmail || 'Sin correo'}
                        </div>
                        {displayRole ? (
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {displayRole}
                            </div>
                        ) : null}
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="sign-out"
                className="gap-2"
                onClick={signOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Cerrar sesión</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserProfileDropdown = withHeaderItem(UserProfileDropdownContent)

export default UserProfileDropdown
