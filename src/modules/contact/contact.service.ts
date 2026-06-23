import httpStatus from 'http-status'
import mongoose from 'mongoose'
import AppError from '../../errors/AppError'
import { Contact } from './contact.model'
import { TCreateContactInput, TUpdateContactInput } from './contact.validation'
import { TContact } from './contact.interface'

const createContact = async (
  payload: TCreateContactInput,
): Promise<TContact> => {
  // Check if contact with same phone already exists
  const existingContact = await Contact.findOne({ phone: payload.phone })

  if (existingContact) {
    // If exists, update the existing contact instead of creating duplicate
    const updatedContact = await Contact.findByIdAndUpdate(
      existingContact._id,
      {
        ...payload,
        isProcessed: false, // Reset processed status if new message
      },
      { new: true, runValidators: true },
    )
    return updatedContact!
  }

  const contact = await Contact.create(payload)
  return contact
}

const getAllContacts = async (filters: {
  page: number
  limit: number
  isProcessed?: boolean
  search?: string
}) => {
  const { page, limit, isProcessed, search } = filters
  const skip = (page - 1) * limit

  const query: any = {}

  if (isProcessed !== undefined) {
    query.isProcessed = isProcessed
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [contacts, total] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(query),
  ])

  return {
    contacts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

const getContactById = async (id: string): Promise<TContact> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid contact ID', httpStatus.BAD_REQUEST)
  }

  const contact = await Contact.findById(id)

  if (!contact) {
    throw new AppError('Contact not found', httpStatus.NOT_FOUND)
  }

  return contact
}

const updateContact = async (
  id: string,
  payload: TUpdateContactInput,
): Promise<TContact> => {

    const updateData: Partial<TContact> = { ...payload }

  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid contact ID', httpStatus.BAD_REQUEST)
  }

  // If marking as processed, add processedAt timestamp
  if (payload.isProcessed === true) {
    updateData.processedAt = new Date()
  }
    

  const contact = await Contact.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  if (!contact) {
    throw new AppError('Contact not found', httpStatus.NOT_FOUND)
  }

  return contact
}

const deleteContact = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid contact ID', httpStatus.BAD_REQUEST)
  }

  const result = await Contact.findByIdAndDelete(id)

  if (!result) {
    throw new AppError('Contact not found', httpStatus.NOT_FOUND)
  }
}

const markAsProcessed = async (id: string): Promise<TContact> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid contact ID', httpStatus.BAD_REQUEST)
  }

  const contact = await Contact.findByIdAndUpdate(
    id,
    { isProcessed: true, processedAt: new Date() },
    { new: true },
  )

  if (!contact) {
    throw new AppError('Contact not found', httpStatus.NOT_FOUND)
  }

  return contact
}

export const ContactService = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  markAsProcessed,
}
