import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, description, imageUrl } = body
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl
      }
    })

    return NextResponse.json(contestant)
  } catch {
    return NextResponse.json({ error: 'Failed to update contestant' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    await prisma.contestant.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Contestant deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete contestant' }, { status: 500 })
  }
}