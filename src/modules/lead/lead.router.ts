import { Router } from 'express'
import { LeadController } from './lead.controller'
import validateRequest from '../../middleware/validateRequest'
import {
  createLeadSchema,
  getLeadByPhoneSchema,
  updateLeadSchema,
  validateVinSchema,
} from './lead.validation'

const router = Router()

router.post('/', validateRequest(createLeadSchema), LeadController.createLead)

router.get('/', LeadController.getAllLeads)

router.get(
  '/phone/:phone',
  validateRequest(getLeadByPhoneSchema),
  LeadController.getLeadByPhone,
)

router.get('/:id', LeadController.getLeadById)

router.patch(
  '/:id',
  validateRequest(updateLeadSchema),
  LeadController.updateLead,
)

router.delete('/:id', LeadController.deleteLead)

router.post('/:id/sync-InsuredMine', LeadController.syncToInsuredMine)

router.post('/:id/sync-hawksoft', LeadController.syncToHawkSoft)

export const LeadRoutes = router
