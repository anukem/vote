import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (adminSession?.value === 'authenticated') {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Set secure cookie for admin session
    const cookieStore = await cookies()
    cookieStore.set('admin-session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return NextResponse.json({ success: true, message: 'Authentication successful' })
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin-session')
    
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}