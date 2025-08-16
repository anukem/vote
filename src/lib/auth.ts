import { cookies } from 'next/headers'

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    return adminSession?.value === 'authenticated'
  } catch {
    return false
  }
}

export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
}