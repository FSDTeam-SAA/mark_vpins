import { Router } from 'express'
import { RetellWebhook } from './retell.webhook'

const router = Router()

// Retell sends webhooks to this endpoint
router.post('/call-status', RetellWebhook.handleRetellWebhook)

// Your backend endpoints for Retell functions
router.get(
  '/function-result/:callId/:functionName',
  RetellWebhook.getFunctionResult,
)

export const RetellWebhookRoutes = router
