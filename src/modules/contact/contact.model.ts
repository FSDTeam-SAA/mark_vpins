import { model, Schema } from 'mongoose'
import { IContactModel, TContact } from './contact.interface'

const ContactSchema = new Schema<TContact, IContactModel>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: false,
    },
    message: {
      type: String,
      trim: true,
      required: false,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster lookups
ContactSchema.index({ phone: 1, createdAt: -1 })
ContactSchema.index({ isProcessed: 1 })
ContactSchema.index({ createdAt: -1 })

// Static method to check if phone exists
ContactSchema.statics.isPhoneExists = async function (
  phone: string,
): Promise<boolean> {
  const contact = await this.findOne({ phone })
  return !!contact
}

export const Contact = model<TContact, IContactModel>('Contact', ContactSchema)
