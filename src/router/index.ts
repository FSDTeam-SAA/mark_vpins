import { Router } from 'express'
import userRouter from '../modules/user/user.router'
import authRouter from '../modules/auth/auth.router'
import { LeadRoutes } from '../modules/lead/lead.router'
import { VINValidationRoutes } from '../modules/vinValidation/vinValidation.router'
import { CallLogRoutes } from '../modules/callLog/callLog.router'
import { ContactRoutes } from '../modules/contact/contact.routes'

const router = Router()

const moduleRoutes = [
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/leads',
    route: LeadRoutes,
  },
  {
    path: '/vin',
    route: VINValidationRoutes,
  },
  {
    path: '/call-logs',
    route: CallLogRoutes 
  },
  {
    path: '/contacts',
    route: ContactRoutes
  }
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
