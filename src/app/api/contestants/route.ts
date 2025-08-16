import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contestants = await prisma.contestant.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(contestants)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const contestant = await prisma.contestant.create({
      data: {
        name,
        description,
        imageUrl
      }
    })

    return NextResponse.json(contestant, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create contestant' }, { status: 500 })
  }
}