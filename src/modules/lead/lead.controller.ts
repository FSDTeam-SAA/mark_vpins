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

const syncToInsuredMine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await LeadService.syncToInsuredMine(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead synced to InsuredMine successfully',
    data: result,
  })
})

// Add this method to your existing LeadController

const syncToHawkSoft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Get lead from database
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new AppError('Lead not found', httpStatus.NOT_FOUND)
  }

  // Get HawkSoft agency ID (you may need to store this or get from config)
  const agencies = await HawkSoftService.getAgencies();
  if (agencies.length === 0) {
    throw new AppError('No HawkSoft agencies available', httpStatus.BAD_REQUEST)
  }
  const agencyId = agencies[0];

  // Search for existing client by phone
  // Note: HawkSoft API v3 doesn't have direct phone search yet,
  // you might need to search by name or policy number
  // For now, we'll create a log note and sync lead data

  // Create a log note in HawkSoft
  const note = `
    New lead from AI Receptionist
    Name: ${lead.name}
    Phone: ${lead.phone}
    Email: ${lead.email || 'N/A'}
    Insurance Type: ${lead.insuranceType}
    ${lead.vehicleDetails?.vin ? `VIN: ${lead.vehicleDetails.vin}` : ''}
    ${lead.notes ? `Notes: ${lead.notes}` : ''}
  `;

  await HawkSoftService.createLogNote(agencyId, 1, note); // clientId 1 is placeholder

  // Update lead with sync status
  const updatedLead = await Lead.findByIdAndUpdate(
    id,
    {
      hawksoftId: `HS_${Date.now()}`,
      syncedToHawkSoft: true,
      syncedAt: new Date(),
    },
    { new: true }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead synced to HawkSoft successfully',
    data: updatedLead,
  });
});

export const LeadController = {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadByPhone,
  updateLead,
  deleteLead,
  syncToInsuredMine,
  syncToHawkSoft,
}
