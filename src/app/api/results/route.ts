import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateRCV } from '@/lib/rcv'

export async function GET() {
  try {
    // Fetch all votes with rankings and contestant information
    const votes = await prisma.vote.findMany({
      include: {
        rankings: {
          include: {
            contestant: true
          },
          orderBy: { rank: 'asc' }
        }
      }
    })

    // Fetch all contestants
    const contestants = await prisma.contestant.findMany({
      orderBy: { name: 'asc' }
    })

    if (votes.length === 0) {
      return NextResponse.json({
        results: null,
        contestants,
        totalVotes: 0,
        message: 'No votes have been cast yet'
      })
    }

    // Calculate RCV results
    const rcvResults = calculateRCV(votes, contestants)

    return NextResponse.json({
      results: rcvResults,
      contestants,
      totalVotes: votes.length
    })
  } catch (error) {
    console.error('Results calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate results' }, { status: 500 })
  }
}