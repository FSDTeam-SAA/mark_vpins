import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { ContactController } from './contact.controller'
import {
  createContactValidationSchema,
  updateContactValidationSchema,
  getContactsQuerySchema,
} from './contact.validation'

const router = express.Router()

// POST /api/contacts - Create a new contact
router.post(
  '/',
  validateRequest(createContactValidationSchema),
  ContactController.createContact,
)

// GET /api/contacts - Get all contacts with pagination and filters
router.get(
  '/',
  validateRequest(getContactsQuerySchema),
  ContactController.getAllContacts,
)

// GET /api/contacts/:id - Get a single contact by ID
router.get('/:id', ContactController.getContactById)

// PATCH /api/contacts/:id - Update a contact
router.patch(
  '/:id',
  validateRequest(updateContactValidationSchema),
  ContactController.updateContact,
)

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', ContactController.deleteContact)

// PATCH /api/contacts/:id/process - Mark contact as processed
router.patch('/:id/process', ContactController.markAsProcessed)

export const ContactRoutes = router
