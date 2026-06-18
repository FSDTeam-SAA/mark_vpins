import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { LeadService } from './lead.service' 
import { Lead } from './lead.model'
import AppError from '../../errors/AppError'
import { HawkSoftService } from '../../services/hawksoft.service'

const createLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await LeadService.createLead(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Lead created successfully',
    data: lead,
  })
})

const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, insuranceType } = req.query
  const result = await LeadService.getAllLeads({
    page: Number(page),
    limit: Number(limit),
    status: status as string,
    insuranceType: insuranceType as string,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leads retrieved successfully',
    data: result,
  })
})

const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const lead = await LeadService.getLeadById(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead retrieved successfully',
    data: lead,
  })
})

const getLeadByPhone = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.params
  const lead = await LeadService.getLeadByPhone(phone)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead retrieved successfully',
    data: lead,
  })
})

const updateLead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const lead = await LeadService.updateLead(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead updated successfully',
    data: lead,
  })
})

const deleteLead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  await LeadService.deleteLead(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead deleted successfully',
    data: null,
  })
})


const syncToHawkSoft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params

  // Get lead from database
  const lead = await Lead.findById(id)
  if (!lead) {
    throw new AppError('Lead not found', httpStatus.NOT_FOUND)
  }

  // Get HawkSoft agency ID
  const agencies = await HawkSoftService.getAgencies()
  console.log('HawkSoft Agencies:', agencies)

  if (agencies.length === 0) {
    throw new AppError('No HawkSoft agencies available', httpStatus.BAD_REQUEST)
  }
  const agencyId = agencies[0]
  console.log('Using Agency ID:', agencyId)

  // Get client list - returns array of client IDs
  const clientIds = await HawkSoftService.getClientList(agencyId, 10, 0)
  console.log('Available Client IDs:', clientIds)

  if (!clientIds || clientIds.length === 0) {
    throw new AppError(
      'No clients found in HawkSoft agency',
      httpStatus.BAD_REQUEST,
    )
  }

  // Use the first client ID
  const clientId = clientIds[0]
  console.log('Using Client ID for log note:', clientId)

  // Format the note with lead information
  const noteData = `
New Lead from AI Receptionist
─────────────────────────────
Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email || 'N/A'}
Insurance Type: ${lead.insuranceType}
${lead.vehicleDetails?.vin ? `VIN: ${lead.vehicleDetails.vin}` : ''}
${lead.notes ? `\nNotes: ${lead.notes}` : ''}
─────────────────────────────
${new Date().toLocaleString()}
  `.trim()

  // Create the log note
  await HawkSoftService.createLogNote(agencyId, clientId, noteData)

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

export const LeadController = {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadByPhone,
  updateLead,
  deleteLead,
  // syncToInsuredMine,
  syncToHawkSoft,
}
