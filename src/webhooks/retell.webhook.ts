import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import { CallLogService } from '../modules/callLog/callLog.service'
import { LeadService } from '../modules/lead/lead.service'
import logger from '../logger'

// Retell webhook event types
type RetellEvent =
  | 'call_started'
  | 'call_ended'
  | 'call_analysis'
  | 'function_call'

interface RetellWebhookPayload {
  event: RetellEvent
  call_id: string
  phone_number: string
  customer_number: string
  start_timestamp?: number
  end_timestamp?: number
  duration_ms?: number
  call_analysis?: {
    transcript?: string
    summary?: string
    user_sentiment?: string
  }
  function_call?: {
    name: string
    arguments: Record<string, any>
  }
  function_call_result?: any
}

// Handle incoming Retell webhook
const handleRetellWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload: RetellWebhookPayload = req.body

  logger.info(
    {
      event: payload.event,
      call_id: payload.call_id,
    },
    'Received Retell webhook:',
  )

  switch (payload.event) {
    case 'call_started':
      await handleCallStarted(payload)
      break

    case 'call_ended':
      await handleCallEnded(payload)
      break

    case 'call_analysis':
      await handleCallAnalysis(payload)
      break

    case 'function_call':
      await handleFunctionCall(payload)
      break

    default:
      logger.warn('Unknown Retell event:', payload.event)
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook received',
    data: { received: true },
  })
})

async function handleCallStarted(payload: RetellWebhookPayload) {
  await CallLogService.createCallLog({
    callId: payload.call_id,
    phoneNumber: payload.customer_number,
    startTime: new Date(),
    status: 'Started',
    collectedData: {},
  })
}

async function handleCallEnded(payload: RetellWebhookPayload) {
  const existingLog = await CallLogService.getCallLogByCallId(payload.call_id)

  if (existingLog) {
    await CallLogService.updateCallLog(existingLog._id!.toString(), {
      endTime: new Date(),
      duration: payload.duration_ms
        ? Math.floor(payload.duration_ms / 1000)
        : undefined,
      status: 'Completed',
    })
  }
}

async function handleCallAnalysis(payload: RetellWebhookPayload) {
  const existingLog = await CallLogService.getCallLogByCallId(payload.call_id)

  if (existingLog && payload.call_analysis) {
    await CallLogService.updateCallLog(existingLog._id!.toString(), {
      transcript: payload.call_analysis.transcript,
      summary: payload.call_analysis.summary,
    })
  }
}

async function handleFunctionCall(payload: RetellWebhookPayload) {
  if (!payload.function_call) return

  const { name, arguments: args } = payload.function_call

  logger.info(
    {
      event: 'function_call_from_retell',
      name,
      args,
    },
    'Function call from Retell',
  )
  // Store the function call in call log
  const existingLog = await CallLogService.getCallLogByCallId(payload.call_id)

  if (existingLog) {
    const collectedData = existingLog.collectedData || {}
    collectedData[`function_${name}`] = args

    await CallLogService.updateCallLog(existingLog._id!.toString(), {
      collectedData,
    })
  }

  // Note: Actual function responses will be sent via Retell API
  // This just logs what Retell is requesting
}

// Endpoint for Retell to get function results
const getFunctionResult = catchAsync(async (req: Request, res: Response) => {
  const { callId, functionName } = req.params

  // This would be implemented based on your function call results
  // For now, return a placeholder

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Function result retrieved',
    data: {
      callId,
      functionName,
      result: { status: 'pending' },
    },
  })
})

export const RetellWebhook = {
  handleRetellWebhook,
  getFunctionResult,
}
