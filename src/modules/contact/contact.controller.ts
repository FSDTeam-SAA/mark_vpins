import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { ContactService } from './contact.service'

const createContact = catchAsync(async (req: Request, res: Response) => {
  const contact = await ContactService.createContact(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Contact created successfully',
    data: contact,
  })
})

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, isProcessed, search } = req.query

  const result = await ContactService.getAllContacts({
    page: Number(page),
    limit: Number(limit),
    isProcessed: isProcessed ? isProcessed === 'true' : undefined,
    search: search as string,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contacts retrieved successfully',
    data: result,
  })
})

const getContactById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const contact = await ContactService.getContactById(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact retrieved successfully',
    data: contact,
  })
})

const updateContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const contact = await ContactService.updateContact(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact updated successfully',
    data: contact,
  })
})

const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  await ContactService.deleteContact(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact deleted successfully',
    data: null,
  })
})

const markAsProcessed = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const contact = await ContactService.markAsProcessed(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact marked as processed successfully',
    data: contact,
  })
})

export const ContactController = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  markAsProcessed,
}
