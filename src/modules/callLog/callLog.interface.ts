import { Types } from 'mongoose'

export type TCallStatus =
  | 'Started'
  | 'InProgress'
  | 'Completed'
  | 'Dropped'
  | 'Failed'

export interface TCallLog {
  _id?: Types.ObjectId
  callId: string // Retell call ID
  phoneNumber: string
  customerName?: string
  startTime: Date
  endTime?: Date
  duration?: number // in seconds
  status: TCallStatus
  transcript?: string
  recordingUrl?: string
  summary?: string
  collectedData: {
    name?: string
    phone?: string
    email?: string
    insuranceType?: string
    vin?: string
    address?: string
    [key: string]: any
  }
  leadId?: Types.ObjectId
  retellResponse?: any // Store raw Retell response
  errorMessage?: string
  createdAt?: Date
  updatedAt?: Date
}
