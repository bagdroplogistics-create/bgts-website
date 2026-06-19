// ─── Zod validation schemas ───────────────────────────────────────────────
import { z } from 'zod'
import { CITIES } from './freight-calculator'

// ─── Step 1: Route ────────────────────────────────────────────────────────
// routeBaseSchema is a plain ZodObject so .merge() works downstream.
// routeSchema adds the cross-field refinement for use in the Step 1 form only.
export const routeBaseSchema = z.object({
  originCity: z
    .string({ required_error: 'Please select origin city' })
    .min(1, 'Please select origin city'),
  destinationCity: z
    .string({ required_error: 'Please select destination city' })
    .min(1, 'Please select destination city'),
  serviceType: z
    .string({ required_error: 'Please select a service' })
    .min(1, 'Please select a service'),
  preferredDate: z.string().optional(),
})

export const routeSchema = routeBaseSchema.refine(
  (data) => data.originCity !== data.destinationCity,
  { message: 'Origin and destination must be different', path: ['destinationCity'] }
)

// ─── Step 2: Cargo ────────────────────────────────────────────────────────
export const cargoSchema = z.object({
  weightKg: z
    .number({ required_error: 'Weight is required' })
    .min(1, 'Minimum weight is 1 kg')
    .max(100000, 'Maximum 100,000 kg per booking'),
  packagesCount: z
    .number()
    .min(1)
    .max(10000)
    .optional(),
  declaredValueRs: z
    .number()
    .min(0)
    .max(100_000_000)
    .optional(),
  cargoType: z
    .string({ required_error: 'Please describe your cargo' })
    .min(2, 'Please describe your cargo'),
  specialHandling: z.array(z.string()).optional(),
})

// ─── Step 3: Service options ──────────────────────────────────────────────
export const serviceOptionsSchema = z.object({
  requireInsurance: z.boolean().default(false),
  requireEwayBill:  z.boolean().default(true),
  urgency: z.enum(['economy', 'standard', 'express']).default('standard'),
})

// ─── Step 4: Contact / confirm ────────────────────────────────────────────
export const contactSchema = z.object({
  companyName: z
    .string({ required_error: 'Company name is required' })
    .min(2, 'Minimum 2 characters'),
  contactName: z
    .string({ required_error: 'Contact name is required' })
    .min(2, 'Minimum 2 characters'),
  contactPhone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  contactEmail: z
    .string({ required_error: 'Email is required' })
    .email('Enter a valid email address'),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
})

// ─── Full form (merged) ───────────────────────────────────────────────────
// Merge uses routeBaseSchema (ZodObject). The same origin≠destination check
// is re-applied here so the full wizard also catches the cross-field error.
export const fullBookingSchema = routeBaseSchema
  .merge(cargoSchema)
  .merge(serviceOptionsSchema)
  .merge(contactSchema)
  .refine(
    (data) => data.originCity !== data.destinationCity,
    { message: 'Origin and destination must be different', path: ['destinationCity'] }
  )

export type RouteFormData        = z.infer<typeof routeSchema>
export type CargoFormData        = z.infer<typeof cargoSchema>
export type ServiceOptionsData   = z.infer<typeof serviceOptionsSchema>
export type ContactFormData      = z.infer<typeof contactSchema>
export type FullBookingFormData  = z.infer<typeof fullBookingSchema>

// ─── Tracking form ────────────────────────────────────────────────────────
export const trackingSchema = z.object({
  lrNumber: z
    .string({ required_error: 'LR number is required' })
    .min(8, 'Enter a valid LR number')
    .toUpperCase(),
})

export type TrackingFormData = z.infer<typeof trackingSchema>

// ─── Contact page form ────────────────────────────────────────────────────
export const contactPageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message is required'),
  type: z.enum([
    'general',
    'quote',
    'partnership',
    'complaint',
    'ekohaul',
  ]),
})

export type ContactPageFormData =
  z.infer<typeof contactPageSchema>
