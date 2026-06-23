import { z } from 'zod'

export const createContactValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters'),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Invalid email format').optional(),
    message: z
      .string()
      .max(500, 'Message must be less than 500 characters')
      .optional(),
  }),
})

export const updateContactValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email('Invalid email format').optional(),
    message: z.string().max(500).optional(),
    isProcessed: z.boolean().optional(),
  }),
})

export const getContactsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    isProcessed: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    search: z.string().optional(),
  }),
})

export type TCreateContactInput = z.infer<
  typeof createContactValidationSchema
>['body']
export type TUpdateContactInput = z.infer<
  typeof updateContactValidationSchema
>['body']
