import { model, Schema } from 'mongoose'
import {
  ILeadModel,
  TLead,
  TVehicleDetails,
  TPropertyDetails,
} from './lead.interface'

const VehicleDetailsSchema = new Schema<TVehicleDetails>(
  {
    vin: { type: String, uppercase: true, trim: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    isValidVin: { type: Boolean, default: false },
    validationResponse: { type: Schema.Types.Mixed },
  },
  { _id: false },
)

const PropertyDetailsSchema = new Schema<TPropertyDetails>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, uppercase: true },
    zipCode: { type: String, required: true },
    yearBuilt: { type: Number },
    squareFootage: { type: Number },
    hasPool: { type: Boolean, default: false },
    hasSecuritySystem: { type: Boolean, default: false },
  },
  { _id: false },
)

const LeadSchema = new Schema<TLead, ILeadModel>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    insuranceType: {
      type: String,
      enum: ['Auto', 'Home', 'Commercial', 'Life', 'Health'],
      required: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quoted', 'Converted', 'Lost'],
      default: 'New',
    },
    source: {
      type: String,
      enum: ['Phone Call', 'Web', 'Chat', 'Referral'],
      default: 'Phone Call',
    },
    vehicleDetails: VehicleDetailsSchema,
    propertyDetails: PropertyDetailsSchema,
    businessName: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    numberOfEmployees: { type: Number },
    insuredMineId: { type: String },
    hawksoftId: { type: String },
    zapierWorkflowId: { type: String },
    callLogId: { type: Schema.Types.ObjectId, ref: 'CallLog' },
    callSummary: { type: String },
    notes: { type: String },
    syncedToInsuredMine: { type: Boolean, default: false },
    syncedToHawkSoft: { type: Boolean, default: false },
    syncedAt: { type: Date },
    lastError: { type: String },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster lookups
LeadSchema.index({ phone: 1, createdAt: -1 })
LeadSchema.index({ insuredMineId: 1 })
LeadSchema.index({ status: 1 })

// Static method to check if phone exists
LeadSchema.statics.isPhoneExists = async function (
  phone: string,
): Promise<boolean> {
  const lead = await this.findOne({ phone })
  return !!lead
}

export const Lead = model<TLead, ILeadModel>('Lead', LeadSchema)
