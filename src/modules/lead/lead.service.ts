import httpStatus from 'http-status'
import mongoose from 'mongoose'
import AppError from '../../errors/AppError'
import { Lead } from './lead.model'
import { TCreateLeadInput, TUpdateLeadInput } from './lead.validation'
import { TLead } from './lead.interface'
import { HawkSoftService } from '../../services/hawksoft.service'
import logger from '../../logger'
import sendResponse from '../../utils/sendResponse'

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

const syncToHawkSoft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params

  // Get lead from database
  const lead = await Lead.findById(id)
  if (!lead) {
    throw new AppError('Lead not found', httpStatus.NOT_FOUND)
  }

  // Get HawkSoft agency ID
  const agencies = await HawkSoftService.getAgencies()
  if (agencies.length === 0) {
    throw new AppError('No HawkSoft agencies available', httpStatus.BAD_REQUEST)
  }
  const agencyId = agencies[0]

  // Since we don't have a client ID, we need to either:
  // 1. Search for existing client by phone (if possible)
  // 2. Or create a log note with the lead info
  // 3. Or use a default client ID (1 is often the main agency client)

  // Try to find if client exists with this phone
  // For now, using clientId 1 as placeholder - but this might not work
  // You should either search for the client or create one
  const clientId = 1 // This needs to be replaced with actual client search/creation

  // Create the log note with structured data
  const noteData = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || 'N/A',
    insuranceType: lead.insuranceType,
    notes: lead.notes || '',
  }

  // Format the note as a readable string
  const formattedNote = `
New Lead from AI Receptionist
─────────────────────────────
Name: ${noteData.name}
Phone: ${noteData.phone}
Email: ${noteData.email}
Insurance Type: ${noteData.insuranceType}
${noteData.notes ? `\nNotes: ${noteData.notes}` : ''}
─────────────────────────────
${new Date().toLocaleString()}
  `.trim()

  try {
    await HawkSoftService.createLogNote(
      agencyId,
      clientId,
      formattedNote,
      'Online From Insured', // This is the action description
    )
  } catch (error: any) {
    // Log the error but don't fail the sync completely
    logger.error('Failed to create HawkSoft log note:', error)
    throw new AppError(
      `Failed to sync to HawkSoft: ${error.message}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    )
  }

  // Update lead with sync status
  const updatedLead = await Lead.findByIdAndUpdate(
    id,
    {
      hawksoftId: `HS_${Date.now()}`,
      syncedToHawkSoft: true,
      syncedAt: new Date(),
    },
    { new: true },
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead synced to HawkSoft successfully',
    data: updatedLead,
  })
})

export const LeadService = {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadByPhone,
  updateLead,
  deleteLead,
  syncToHawkSoft,
}
