import { Router } from 'express'
import { CallLogController } from './callLog.controller'

const router = Router()

router.post('/', CallLogController.createCallLog)
router.get('/', CallLogController.getCallLogs)
router.get('/:id', CallLogController.getCallLogById)
router.get('/call-id/:callId', CallLogController.getCallLogByCallId)
router.patch('/:id', CallLogController.updateCallLog)

export const CallLogRoutes = router
