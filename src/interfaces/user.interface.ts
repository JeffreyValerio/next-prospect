export interface IUser {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  username: string
  imageUrl: string
  role: string
  createdAt: number
  lastSignInAt: number | null
}
