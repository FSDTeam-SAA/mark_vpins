import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CallLogService } from './callLog.service' 

const createCallLog = catchAsync(async (req: Request, res: Response) => {
  const callLog = await CallLogService.createCallLog(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Call log created successfully',
    data: callLog,
  })
})

const getCallLogs = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, phoneNumber, status } = req.query
  const result = await CallLogService.getCallLogs({
    page: Number(page),
    limit: Number(limit),
    phoneNumber: phoneNumber as string,
    status: status as string,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call logs retrieved successfully',
    data: result,
  })
})

const getCallLogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const callLog = await CallLogService.getCallLogById(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call log retrieved successfully',
    data: callLog,
  })
})

const getCallLogByCallId = catchAsync(async (req: Request, res: Response) => {
  const { callId } = req.params
  const callLog = await CallLogService.getCallLogByCallId(callId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call log retrieved successfully',
    data: callLog,
  })
})

const updateCallLog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const callLog = await CallLogService.updateCallLog(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Call log updated successfully',
    data: callLog,
  })
})

export const CallLogController = {
  createCallLog,
  getCallLogs,
  getCallLogById,
  getCallLogByCallId,
  updateCallLog,
}
