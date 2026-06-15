import { Router } from 'express'
import { LeadAdminController } from './lead.admin.controller'

const router = Router()

// Public routes (no auth)
router.get('/login', LeadAdminController.renderLoginPage)
router.post('/api/login', LeadAdminController.adminLogin)

// Dashboard page (no auth check for HTML page, but it will check token via JS)
router.get('/dashboard', LeadAdminController.renderDashboard)

// Protected API routes (with admin auth)
router.get(
  '/api/leads',
  LeadAdminController.adminAuth,
  LeadAdminController.getLeadsForAdmin,
)
router.get(
  '/api/statistics',
  LeadAdminController.adminAuth,
  LeadAdminController.getStatistics,
)
router.get(
  '/api/export-csv',
  LeadAdminController.adminAuth,
  LeadAdminController.exportToCSV,
)
router.get(
  '/api/lead/:id',
  LeadAdminController.adminAuth,
  LeadAdminController.getLeadDetails,
)

export const LeadAdminRoutes = router
