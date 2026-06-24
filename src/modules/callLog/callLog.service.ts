import httpStatus from 'http-status'
import mongoose from 'mongoose'
import AppError from '../../errors/AppError'
import { CallLog } from './callLog.model'
import { TCallLog } from './callLog.interface'

const createCallLog = async (payload: Partial<TCallLog>): Promise<TCallLog> => {
  const callLog = await CallLog.create(payload)
  return callLog
}

const getCallLogs = async (filters: {
  page: number
  limit: number
  phoneNumber?: string
  status?: string
}) => {
  const { page, limit, phoneNumber, status } = filters
  const skip = (page - 1) * limit

  const query: any = {}
  if (phoneNumber) query.phoneNumber = phoneNumber
  if (status) query.status = status

  const [callLogs, total] = await Promise.all([
    CallLog.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('leadId'),
    CallLog.countDocuments(query),
  ])

  return {
    callLogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

const getCallLogById = async (id: string): Promise<TCallLog> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid call log ID' , httpStatus.BAD_REQUEST)
  }

  const callLog = await CallLog.findById(id).populate('leadId')

  if (!callLog) {
    throw new AppError('Call log not found', httpStatus.NOT_FOUND)
  }

  return callLog
}

const getCallLogByCallId = async (callId: string): Promise<TCallLog | null> => {
  const callLog = await CallLog.findOne({ callId }).populate('leadId')
  return callLog
}

const updateCallLog = async (
  id: string,
  payload: Partial<TCallLog>,
): Promise<TCallLog> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid call log ID', httpStatus.BAD_REQUEST)
  }

  const callLog = await CallLog.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date() },
    { new: true, runValidators: true },
  )

  if (!callLog) {
    throw new AppError('Call log not found', httpStatus.NOT_FOUND)
  }

  return callLog
}

export const CallLogService = {
  createCallLog,
  getCallLogs,
  getCallLogById,
  getCallLogByCallId,
  updateCallLog,
}
