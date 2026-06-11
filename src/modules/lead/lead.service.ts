import httpStatus from 'http-status'
import mongoose from 'mongoose'
import AppError from '../../errors/AppError'
import { Lead } from './lead.model'
import { TCreateLeadInput, TUpdateLeadInput } from './lead.validation'
import { TLead } from './lead.interface'

const createLead = async (payload: TCreateLeadInput): Promise<TLead> => {
  // Check if lead with same phone already exists
  const existingLead = await Lead.findOne({ phone: payload.phone })

if (existingLead) {
  throw new AppError(
    'Lead with this phone number already exists', // message first
    httpStatus.CONFLICT, // status code second
  )
}
  const lead = await Lead.create(payload)
  return lead
}

const getAllLeads = async (filters: {
  page: number
  limit: number
  status?: string
  insuranceType?: string
}) => {
  const { page, limit, status, insuranceType } = filters
  const skip = (page - 1) * limit

  const query: any = {}
  if (status) query.status = status
  if (insuranceType) query.insuranceType = insuranceType

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('callLogId'),
    Lead.countDocuments(query),
  ])

  return {
    leads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

const getLeadById = async (id: string): Promise<TLead> => {
 if (!mongoose.Types.ObjectId.isValid(id)) {
   throw new AppError('Invalid lead ID', httpStatus.BAD_REQUEST)
 }

  const lead = await Lead.findById(id).populate('callLogId')

 if (!lead) {
   throw new AppError('Lead not found', httpStatus.NOT_FOUND)
 }


  return lead
}

const getLeadByPhone = async (phone: string): Promise<TLead | null> => {
  const lead = await Lead.findOne({ phone }).populate('callLogId')
  return lead
}

const updateLead = async (
  id: string,
  payload: TUpdateLeadInput,
): Promise<TLead> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid lead ID', httpStatus.BAD_REQUEST)
  }

  const lead = await Lead.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date() },
    { new: true, runValidators: true },
  )

  if (!lead) {
    throw new AppError('Lead not found', httpStatus.NOT_FOUND)
  }

  return lead
}

const deleteLead = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid lead ID', httpStatus.BAD_REQUEST)
  }

  const result = await Lead.findByIdAndDelete(id)

if (!result) {
  throw new AppError('Lead not found', httpStatus.NOT_FOUND)
}
}

const syncToInsuredMine = async (id: string): Promise<any> => {
  const lead = await getLeadById(id)

  // TODO: Implement actual InsuredMine API integration
  // This is a placeholder for now
  console.log('Syncing to InsuredMine:', lead)

  // Update lead with InsuredMine ID
  const updatedLead = await Lead.findByIdAndUpdate(
    id,
    {
      insuredMineId: `IM_${Date.now()}`,
      syncedToInsuredMine: true,
      syncedAt: new Date(),
    },
    { new: true },
  )

  return {
    success: true,
    insuredMineId: updatedLead?.insuredMineId,
    message: 'Lead synced to InsuredMine',
  }
}

export const LeadService = {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadByPhone,
  updateLead,
  deleteLead,
  syncToInsuredMine,
}
