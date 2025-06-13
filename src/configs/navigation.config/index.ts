import dashboardsNavigationConfig from './dashboards.navigation.config'
import uiComponentNavigationConfig from './ui-components.navigation.config'
import conceptsNavigationConfig from './concepts.navigation.config'
import authNavigationConfig from './auth.navigation.config'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    ...dashboardsNavigationConfig,
    ...conceptsNavigationConfig,
    ...uiComponentNavigationConfig,
    ...authNavigationConfig,
]

export default navigationConfig
