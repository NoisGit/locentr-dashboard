import { mock } from './MockAdapter'
import './fakeApi/authFakeApi'
import './fakeApi/commonFakeApi'
import './fakeApi/customersFakeApi'
import './fakeApi/productsFakeApi'
import './fakeApi/projectsFakeApi'
import './fakeApi/ordersFakeApi'
// 🔥 Eliminados porque ya no los necesitas:
// import './fakeApi/fileFakeApi'
// import './fakeApi/mailFakeApi'

import './fakeApi/logFakeApi'
import './fakeApi/calendarFakeApi'
import './fakeApi/accountsFakeApi'
import './fakeApi/aiFakeApi'
import './fakeApi/chatFakeApi'
import './fakeApi/helpCenterFakeApi'
import './fakeApi/dashboardFakeApi'
import './fakeApi/accessFakeApi'
import './fakeApi/accessLogFakeApi'
import './fakeApi/marketplaceFakeApi'
import './fakeApi/logbookFakeApi'

mock.onAny().passThrough()
