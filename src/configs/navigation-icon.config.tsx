import {
    TbActivityHeartbeat,
    TbBuildingEstate,
    TbBuildingSkyscraper,
    TbFileDescription,
    TbHelpHexagon,
    TbLayoutDashboard,
    TbNotebook,
    TbShieldLock,
    TbUsersGroup,
    TbCreditCard,
    TbUserPlus,
} from 'react-icons/tb'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <TbLayoutDashboard />,
    building: <TbBuildingSkyscraper />,
    users: <TbUsersGroup />,
    buildings: <TbBuildingEstate />,
    access: <TbShieldLock />,
    documents: <TbFileDescription />,
    audit: <TbActivityHeartbeat />,
    tickets: <TbHelpHexagon />,
    logbook: <TbNotebook />,
    billing: <TbCreditCard />,
    team: <TbUserPlus />,
}

export default navigationIcon
