import { Router } from 'express'
import userRouter from '../modules/user/user.router'
import authRouter from '../modules/auth/auth.router'
import { LeadRoutes } from '../modules/lead/lead.router'
import { VINValidationRoutes } from '../modules/vinValidation/vinValidation.router'

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
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
