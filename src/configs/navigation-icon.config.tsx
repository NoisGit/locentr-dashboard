import {
    PiBookDuotone,
    PiBuildingOfficeDuotone,
    PiFileTextDuotone,
    PiHouseLineDuotone,
    PiMegaphoneDuotone,
    PiSpeedometerDuotone,
    PiUsersDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <PiSpeedometerDuotone />,
    building: <PiBuildingOfficeDuotone />,
    customers: <PiUsersDuotone />,
    landing: <PiHouseLineDuotone />,
    documentation: <PiBookDuotone />,
    notification: <PiMegaphoneDuotone />,
    accountActivityLogs: <PiFileTextDuotone />,
}

export default navigationIcon
