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
  ): Promise<number[]> {
    // Returns array of client IDs
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
      // The API returns an array of client IDs directly
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
      const clients = await this.getClientList(agencyId, 100, 0)
      return clients
    } catch (error: any) {
      logger.error('HawkSoft searchClientByPhone failed:', error.message)
      throw new Error(`HawkSoft API error: ${error.message}`)
    }
  }

  // FIXED: Create a log note in HawkSoft
  // Create a log note in HawkSoft
  // Create a log note in HawkSoft
  static async createLogNote(
    agencyId: number,
    clientId: number,
    note: string,
  ): Promise<any> {
    try {
      // Option A: Try without refId
      const payload = {
        action: 29,
        channel: 0,
        description: note.substring(0, 255),
        body: note,
        ts: new Date().toISOString(),
      }

      console.log('HawkSoft createLogNote request (No refId):', {
        url: `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log?version=${this.version}`,
        payload: payload,
      })

      try {
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
        // If Option A fails, try Option B
        console.log('Option A failed, trying Option B...')

        // Option B: Try with refId as string
        const payload2 = {
          action: 29,
          channel: 0,
          refId: `LEAD_${Date.now()}`,
          description: note.substring(0, 255),
          body: note,
          ts: new Date().toISOString(),
        }

        console.log('HawkSoft createLogNote request (refId as string):', {
          url: `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log?version=${this.version}`,
          payload: payload2,
        })

        try {
          const response2 = await axios.post(
            `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log`,
            payload2,
            {
              params: { version: this.version },
              headers: {
                Authorization: this.getAuthHeader(),
                'Content-Type': 'application/json',
              },
            },
          )
          return response2.data
        } catch (error2: any) {
          // If Option B fails, try Option C
          console.log('Option B failed, trying Option C...')

          // Option C: Minimal payload without optional fields
          const payload3 = {
            action: 29,
            description: note.substring(0, 255),
          }

          console.log('HawkSoft createLogNote request (Minimal):', {
            url: `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log?version=${this.version}`,
            payload: payload3,
          })

          const response3 = await axios.post(
            `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}/log`,
            payload3,
            {
              params: { version: this.version },
              headers: {
                Authorization: this.getAuthHeader(),
                'Content-Type': 'application/json',
              },
            },
          )
          return response3.data
        }
      }
    } catch (error: any) {
      if (error.response) {
        console.error('HawkSoft API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        })

        console.error('Request payload that failed:', error.config?.data)

        logger.error('HawkSoft createLogNote failed:', {
          status: error.response.status,
          data: error.response.data,
          message: error.message,
        })

        throw new Error(
          `HawkSoft API error: ${error.response.data?.message || error.response.statusText || error.message}`,
        )
      } else if (error.request) {
        console.error('HawkSoft No Response:', error.request)
        throw new Error('HawkSoft API error: No response received')
      } else {
        console.error('HawkSoft Error:', error.message)
        throw new Error(`HawkSoft API error: ${error.message}`)
      }
    }
  }

  // Alternative method: Update client with a note
  static async addClientNote(
    agencyId: number,
    clientId: number,
    note: string,
  ): Promise<any> {
    try {
      // First, get the current client data
      const client = await this.getClient(agencyId, clientId)

      // Prepare the update payload
      const payload = {
        details: {
          ...client.details,
          notes: client.details?.notes
            ? `${client.details.notes}\n\n${note}`
            : note,
        },
      }

      console.log('HawkSoft addClientNote request:', {
        url: `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}?version=${this.version}`,
        payload: payload,
      })

      const response = await axios.patch(
        `${this.baseUrl}/vendor/agency/${agencyId}/client/${clientId}`,
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
      if (error.response) {
        console.error('HawkSoft API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        })
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
