import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  country: z.string().min(2, 'Country is required'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['OWNER', 'ADMIN', 'TECHNICIAN', 'VIEWER']),
    organizationId: z.string(),
  }),
  organization: z.object({
    id: z.string(),
    name: z.string(),
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
    activeUserLimit: z.number(),
    features: z.array(z.string()),
    country: z.string(),
  }),
  requiresSetup: z.boolean().optional(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginRequest = z.infer<typeof LoginSchema>
export type RegisterRequest = z.infer<typeof RegisterSchema>
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>