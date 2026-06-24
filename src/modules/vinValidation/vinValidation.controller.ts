import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { VINValidationService } from './vinValidation.service' 

const validateVIN = catchAsync(async (req: Request, res: Response) => {
  const { vin } = req.body

  // Quick format validation first
  const isValidFormat = VINValidationService.quickValidate(vin)

  if (!isValidFormat) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message:
        'Invalid VIN format. VIN must be 17 characters and not contain I, O, or Q.',
      data: {
        vin,
        isValid: false,
        formatValid: false,
      },
    })
  }

  // Full validation using NHTSA
  const result = await VINValidationService.validateWithNHTSA(vin)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: result.isValid,
    message: result.isValid ? 'VIN is valid' : result.error || 'VIN is invalid',
    data: result,
  })
})

const quickValidateVIN = catchAsync(async (req: Request, res: Response) => {
  const { vin } = req.params
  const isValid = VINValidationService.quickValidate(vin)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: isValid ? 'VIN format is valid' : 'VIN format is invalid',
    data: {
      vin,
      isValid,
      formatValid: isValid,
    },
  })
})

export const VINValidationController = {
  validateVIN,
  quickValidateVIN,
}
