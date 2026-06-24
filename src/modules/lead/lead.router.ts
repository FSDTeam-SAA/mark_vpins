import { Request, Response, Router } from 'express'
import { LeadController } from './lead.controller'
import validateRequest from '../../middleware/validateRequest'
import {
  createLeadSchema,
  getLeadByPhoneSchema,
  updateLeadSchema,
  validateVinSchema,
} from './lead.validation'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status';
import { HawkSoftService } from '../../services/hawksoft.service'
import catchAsync from '../../utils/catchAsync'

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

// router.post('/:id/sync-InsuredMine', LeadController.syncToInsuredMine)

router.post('/:id/sync-hawksoft', LeadController.syncToHawkSoft)

// Add this to your routes for testing
// Add this test endpoint to see the actual response structure
// Update the test endpoint in your router
router.get('/test-hawksoft', catchAsync(async (req: Request, res: Response) => {
  try {
    // Test getting agencies
    const agencies = await HawkSoftService.getAgencies();
    console.log('Agencies:', agencies);

    if (agencies.length > 0) {
      const agencyId = agencies[0];

      // Test getting clients - this returns an array of client IDs
      const clientIds = await HawkSoftService.getClientList(agencyId, 5, 0);
      console.log('Client IDs (first 5):', clientIds.slice(0, 5));

      if (clientIds && clientIds.length > 0) {
        // Use the first client ID from the array
        const clientId = clientIds[0];
        console.log('Using Client ID:', clientId);

        const testNote = 'Test log note from integration at ' + new Date().toISOString();

        const result = await HawkSoftService.createLogNote(agencyId, clientId, testNote);

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'HawkSoft test successful',
          data: {
            agencies,
            clientIds: clientIds.slice(0, 5),
            usedClientId: clientId,
            logResult: result
          },
        });
      } else {
        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'HawkSoft test - No clients found',
          data: { agencies, clientIds: [] },
        });
      }
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'No HawkSoft agencies found',
        data: null,
      });
    }
  } catch (error: any) {
    console.error('Test error:', error);
    // Use httpStatus.INTERNAL_SERVER_ERROR properly
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR || 500,
      success: false,
      message: 'HawkSoft test failed: ' + error.message,
      data: null,
    });
  }
}));


export const LeadRoutes = router
