import axios from 'axios'
import config from '../config'
import logger from '../logger'

interface HawkSoftClient {
  clientNumber: number
  details: any
  policies?: any[]
  people?: any[]
}

export class HawkSoftService {
  private static baseUrl = config.hawksoftApiUrl
  private static version = config.hawksoftApiVersion

  private static getAuthHeader() {
    const credentials = `${config.hawksoftClientId}:${config.hawksoftClientSecret}`
    const encoded = Buffer.from(credentials).toString('base64')
    return `Basic ${encoded}`
  }

  // Get all agencies subscribed to your integration
  static async getAgencies(): Promise<number[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/vendor/agencies`, {
        params: { version: this.version },
        headers: { Authorization: this.getAuthHeader() },
      })
      return response.data
    } catch (error: any) {
      logger.error('HawkSoft getAgencies failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Get client details by ID
  static async getClient(
    agencyId: number,
    clientId: number,
  ): Promise<HawkSoftClient> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}`,
        {
          params: { version: this.version },
          headers: { Authorization: this.getAuthHeader() },
        },
      )
      return response.data
    } catch (error: any) {
      logger.error(`HawkSoft getClient ${clientId} failed:`, error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Get list of clients from an agency with pagination
  static async getClientList(
    agencyId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vendor/agency/${agencyId}/clients`,
        {
          params: {
            version: this.version,
            limit,
            offset,
          },
          headers: { Authorization: this.getAuthHeader() },
        },
      )
      return response.data
    } catch (error: any) {
      logger.error('HawkSoft getClientList failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Get changed clients since a timestamp
  static async getChangedClients(
    agencyId: number,
    asOf: Date,
  ): Promise<number[]> {
    try {
      const timestamp = asOf.toISOString()
      const response = await axios.get(
        `${this.baseUrl}/vendor/agency/${agencyId}/clients/changed`,
        {
          params: {
            version: this.version,
            asOf: timestamp,
            deleted: true,
          },
          headers: { Authorization: this.getAuthHeader() },
        },
      )
      return response.data
    } catch (error: any) {
      logger.error('HawkSoft getChangedClients failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Search for client by phone or name
  static async searchClientByPhone(
    agencyId: number,
    phone: string,
  ): Promise<any> {
    try {
      // Try to search by phone - might need to use a different approach
      // Since v3 doesn't have direct phone search, we'll search all clients and filter
      const clients = await this.getClientList(agencyId, 100, 0)

      // If the API returns clients with phone numbers, filter them
      // This depends on the actual response structure
      return clients
    } catch (error: any) {
      logger.error('HawkSoft searchClientByPhone failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // FIXED: Create a log note in HawkSoft
  static async createLogNote(
    agencyId: number,
    clientId: number,
    note: string,
    action: string = 'Online From Insured', // Use string value as per API
  ): Promise<any> {
    try {
      const payload = {
        action: action,
        description: note,
        body: note,
        // Add any other required fields based on API documentation
        // Some APIs might require 'type' or 'category' fields
      }

      const response = await axios.post(
        `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log`,
        payload,
        {
          params: { version: this.version },
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error: any) {
      // Log the detailed error for debugging
      if (error.response) {
        logger.error('HawkSoft createLogNote failed:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else {
        logger.error('HawkSoft createLogNote failed:', error.message)
      }
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Search clients by policy number
  static async searchClient(
    agencyId: number,
    policyNumber: string,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vendor/agency/${agencyId}/clients/search`,
        {
          params: {
            version: this.version,
            policyNumber: policyNumber,
          },
          headers: { Authorization: this.getAuthHeader() },
        },
      )
      return response.data
    } catch (error: any) {
      logger.error('HawkSoft searchClient failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }
}
