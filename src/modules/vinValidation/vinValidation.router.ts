import { Router } from 'express'
import { VINValidationController } from './vinValidation.controller'
import validateRequest from '../../middleware/validateRequest'
import { validateVinSchema } from '../lead/lead.validation'

const router = Router()

router.post(
  '/validate',
  validateRequest(validateVinSchema),
  VINValidationController.validateVIN,
)

router.get('/validate/:vin', VINValidationController.quickValidateVIN)

export const VINValidationRoutes = router
