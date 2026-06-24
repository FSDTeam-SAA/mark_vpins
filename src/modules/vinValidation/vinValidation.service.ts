import axios from 'axios'
import logger from '../../logger'

export interface IVINValidationResult {
  isValid: boolean
  vin: string
  make?: string
  model?: string
  year?: number
  bodyClass?: string
  fuelType?: string
  engineCylinders?: number
  error?: string
}

export class VINValidationService {
  private static readonly NHTSA_API_URL =
    'https://vpic.nhtsa.dot.gov/api/vehicles'

  /**
   * Validate VIN using NHTSA API (free, no API key required)
   */
  static async validateWithNHTSA(vin: string): Promise<IVINValidationResult> {
    try {
      // Normalize VIN: uppercase, remove spaces
      const normalizedVin = vin.toUpperCase().replace(/\s/g, '')

      if (normalizedVin.length !== 17) {
        return {
          isValid: false,
          vin: normalizedVin,
          error: 'VIN must be exactly 17 characters',
        }
      }

      // Decode VIN using NHTSA API
      const response = await axios.get(
        `${this.NHTSA_API_URL}/decodevinvalues/${normalizedVin}?format=json`,
      )

      const data = response.data.Results?.[0]

      if (!data) {
        return {
          isValid: false,
          vin: normalizedVin,
          error: 'Unable to decode VIN',
        }
      }

      // Check if VIN is valid
      const isValid =
        data.ErrorCode === '0' && data.ModelYear && data.Make && data.Model

      return {
        isValid,
        vin: normalizedVin,
        make: data.Make || undefined,
        model: data.Model || undefined,
        year: data.ModelYear ? parseInt(data.ModelYear) : undefined,
        bodyClass: data.BodyClass || undefined,
        fuelType: data.FuelTypePrimary || undefined,
        engineCylinders: data.EngineCylinders || undefined,
      }
    } catch (error) {
      // Better: Pass error as metadata object
      logger.error({ err: error, vin }, 'VIN validation failed')

      return {
        isValid: false,
        vin,
        error: 'VIN validation service error',
      }
    }
  }

  /**
   * Quick validation without API call (check format only)
   */
  static quickValidate(vin: string): boolean {
    const normalizedVin = vin.toUpperCase().replace(/\s/g, '')

    // Check length
    if (normalizedVin.length !== 17) return false

    // Check for invalid characters (I, O, Q are not allowed)
    const invalidChars = /[IOQ]/
    if (invalidChars.test(normalizedVin)) return false

    return true
  }

  /**
   * Format VIN for display
   */
  static formatVIN(vin: string): string {
    return vin.toUpperCase().replace(/\s/g, '')
  }
}
