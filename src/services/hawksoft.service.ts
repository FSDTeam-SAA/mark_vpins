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
            deleted: true, // Include deleted clients
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

  // Create a log note in HawkSoft
  static async createLogNote(
    agencyId: number,
    clientId: number,
    note: string,
    action: number = 29, // Online From Insured
  ): Promise<any> {
    try {
      const payload = {
        action: action,
        description: note,
        body: note,
        ts: new Date().toISOString(),
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
      logger.error(`HawkSoft createLogNote failed:`, error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // Search clients (HS6 only - in development)
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
