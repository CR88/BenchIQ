import { z } from 'zod'
import { TimestampsSchema, ContactInfoSchema } from '../common'

export const UserRoleSchema = z.enum(['OWNER', 'ADMIN', 'TECHNICIAN', 'VIEWER'])

export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING'])

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: UserRoleSchema,
  status: UserStatusSchema,
  organizationId: z.string().uuid(),
  contact: ContactInfoSchema.optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }),
  }),
  lastLoginAt: z.date().nullable(),
  ...TimestampsSchema.shape,
})

export const CreateUserSchema = UserSchema.omit({
  id: true,
  status: true,
  organizationId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).partial({
  role: true,
  contact: true,
  preferences: true,
})

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
}).partial()

export const UserProfileSchema = UserSchema.omit({
  organizationId: true,
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type UserStatus = z.infer<typeof UserStatusSchema>
export type CreateUserRequest = z.infer<typeof CreateUserSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>