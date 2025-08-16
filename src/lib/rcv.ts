interface VoteBallot {
  id: number
  rankings: Array<{
    contestantId: number
    rank: number
    contestant: {
      id: number
      name: string
    }
  }>
}

interface Contestant {
  id: number
  name: string
}

interface RoundResult {
  round: number
  votes: Record<number, number>
  eliminated?: number
  winner?: number
  totalVotes: number
}

interface RCVResult {
  rounds: RoundResult[]
  winner: Contestant | null
  totalBallots: number
}

export function calculateRCV(ballots: VoteBallot[], contestants: Contestant[]): RCVResult {
  if (ballots.length === 0) {
    return {
      rounds: [],
      winner: null,
      totalBallots: 0
    }
  }

  const results: RCVResult = {
    rounds: [],
    winner: null,
    totalBallots: ballots.length
  }

  const activeContestants = new Set(contestants.map(c => c.id))
  const activeBallots = ballots.map(ballot => ({
    ...ballot,
    rankings: ballot.rankings.sort((a, b) => a.rank - b.rank)
  }))

  let round = 1

  while (activeContestants.size > 1) {
    // Count first-choice votes for active contestants
    const voteCounts: Record<number, number> = {}
    
    // Initialize counts for all active contestants
    activeContestants.forEach(id => {
      voteCounts[id] = 0
    })

    // Count votes
    activeBallots.forEach(ballot => {
      // Find the highest-ranked active contestant on this ballot
      const firstChoice = ballot.rankings.find(ranking => 
        activeContestants.has(ranking.contestantId)
      )
      
      if (firstChoice) {
        voteCounts[firstChoice.contestantId]++
      }
    })

    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0)
    const majority = Math.floor(totalVotes / 2) + 1

    // Check for majority winner
    const winner = Object.entries(voteCounts).find(([, votes]) => votes >= majority)
    
    if (winner) {
      const winnerId = parseInt(winner[0])
      const winnerContestant = contestants.find(c => c.id === winnerId)
      
      results.rounds.push({
        round,
        votes: voteCounts,
        winner: winnerId,
        totalVotes
      })
      
      results.winner = winnerContestant || null
      break
    }

    // Find contestant(s) with fewest votes to eliminate
    const minVotes = Math.min(...Object.values(voteCounts))
    const toEliminate = Object.entries(voteCounts)
      .filter(([, votes]) => votes === minVotes)
      .map(([id]) => parseInt(id))

    // Eliminate the contestant with the fewest votes (if tie, eliminate the one with lower ID)
    const eliminated = Math.min(...toEliminate)
    
    results.rounds.push({
      round,
      votes: voteCounts,
      eliminated,
      totalVotes
    })

    activeContestants.delete(eliminated)
    round++

    // Safety check to prevent infinite loops
    if (round > 100) {
      console.error('RCV calculation exceeded maximum rounds')
      break
    }
  }

  // If only one contestant remains and no winner was declared
  if (activeContestants.size === 1 && !results.winner) {
    const remainingId = Array.from(activeContestants)[0]
    results.winner = contestants.find(c => c.id === remainingId) || null
  }

  return results
}