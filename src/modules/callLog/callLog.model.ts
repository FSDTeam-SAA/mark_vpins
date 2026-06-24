import { model, Schema } from 'mongoose'
import { TCallLog } from './callLog.interface'

const CallLogSchema = new Schema<TCallLog>(
  {
    callId: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true, index: true },
    customerName: { type: String },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number },
    status: {
      type: String,
      enum: ['Started', 'InProgress', 'Completed', 'Dropped', 'Failed'],
      default: 'Started',
    },
    transcript: { type: String },
    recordingUrl: { type: String },
    summary: { type: String },
    collectedData: { type: Schema.Types.Mixed, default: {} },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    retellResponse: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

// Compound index for phone number and date
CallLogSchema.index({ phoneNumber: 1, startTime: -1 })

export const CallLog = model<TCallLog>('CallLog', CallLogSchema)
