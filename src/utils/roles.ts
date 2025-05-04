import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  const userRole = (sessionClaims?.metadata as { role?: Roles })?.role;
  return userRole === role;
}