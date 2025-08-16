import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rankings } = body
    
    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      return NextResponse.json({ error: 'Rankings are required' }, { status: 400 })
    }

    const ipAddress = getClientIP(request)
    
    // Check if this IP has already voted
    const existingVote = await prisma.vote.findUnique({
      where: { ipAddress }
    })
    
    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 })
    }

    // Validate rankings format
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i]
      if (!ranking.contestantId || typeof ranking.rank !== 'number') {
        return NextResponse.json({ error: 'Invalid ranking format' }, { status: 400 })
      }
    }

    // Create vote with rankings in a transaction
    const vote = await prisma.$transaction(async (tx) => {
      const newVote = await tx.vote.create({
        data: {
          ipAddress,
          rankings: {
            create: rankings.map((ranking: { contestantId: number; rank: number }) => ({
              contestantId: ranking.contestantId,
              rank: ranking.rank
            }))
          }
        },
        include: {
          rankings: {
            include: {
              contestant: true
            }
          }
        }
      })
      
      return newVote
    })

    return NextResponse.json({ message: 'Vote submitted successfully', vote }, { status: 201 })
  } catch (error) {
    console.error('Vote submission error:', error)
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request)
    
    const vote = await prisma.vote.findUnique({
      where: { ipAddress },
      include: {
        rankings: {
          include: {
            contestant: true
          },
          orderBy: { rank: 'asc' }
        }
      }
    })
    
    return NextResponse.json({ hasVoted: !!vote, vote })
  } catch {
    return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
  }
}