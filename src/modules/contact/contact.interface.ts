import { Model } from 'mongoose'

export interface TContact {
  fullName: string
  phone: string
  email?: string
  message?: string
  isProcessed: boolean
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IContactModel extends Model<TContact> {
  isPhoneExists(phone: string): Promise<boolean>
}
