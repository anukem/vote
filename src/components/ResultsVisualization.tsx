'use client'

import Image from 'next/image'

interface Contestant {
  id: number
  name: string
  description?: string
  imageUrl?: string
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

interface ResultsVisualizationProps {
  results: RCVResult
  contestants: Contestant[]
  totalVotes: number
}

export default function ResultsVisualization({ results, contestants, totalVotes }: ResultsVisualizationProps) {
  if (!results || results.rounds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No votes have been cast yet.</p>
      </div>
    )
  }

  const getContestantName = (id: number) => {
    return contestants.find(c => c.id === id)?.name || `Contestant ${id}`
  }

  const getContestantById = (id: number) => {
    return contestants.find(c => c.id === id)
  }

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0'
  }

  const majority = Math.floor(totalVotes / 2) + 1

  return (
    <div className="space-y-8">
      {/* Winner Announcement */}
      {results.winner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Winner!</h2>
            <div className="flex items-center justify-center space-x-4">
              {results.winner.imageUrl && (
                <Image
                  src={results.winner.imageUrl}
                  alt={results.winner.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-green-800">{results.winner.name}</h3>
                {results.winner.description && (
                  <p className="text-green-600">{results.winner.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vote Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Vote Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
            <div className="text-blue-800">Total Votes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{results.rounds.length}</div>
            <div className="text-purple-800">Elimination Rounds</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{majority}</div>
            <div className="text-green-800">Votes Needed to Win</div>
          </div>
        </div>
      </div>

      {/* Round-by-Round Results */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Round-by-Round Results</h3>
        
        {results.rounds.map((round, index) => {
          const sortedContestants = Object.entries(round.votes)
            .map(([id, votes]) => ({ id: parseInt(id), votes }))
            .sort((a, b) => b.votes - a.votes)

          return (
            <div key={round.round} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  Round {round.round}
                  {round.winner && <span className="text-green-600 ml-2">- Winner Declared!</span>}
                  {round.eliminated && !round.winner && (
                    <span className="text-red-600 ml-2">
                      - {getContestantName(round.eliminated)} Eliminated
                    </span>
                  )}
                </h4>
                <div className="text-sm text-gray-600">
                  {round.totalVotes} votes counted
                </div>
              </div>

              <div className="space-y-3">
                {sortedContestants.map((contestant) => {
                  const contestantData = getContestantById(contestant.id)
                  const isWinner = round.winner === contestant.id
                  const isEliminated = round.eliminated === contestant.id
                  const percentage = getVotePercentage(contestant.votes, round.totalVotes)
                  
                  return (
                    <div
                      key={contestant.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${
                        isWinner ? 'bg-green-100 border border-green-300' :
                        isEliminated ? 'bg-red-100 border border-red-300' :
                        'bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </div>
                      
                      {contestantData?.imageUrl && (
                        <Image
                          src={contestantData.imageUrl}
                          alt={contestantData.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {getContestantName(contestant.id)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {contestant.votes} votes ({percentage}%)
                            </span>
                            {isWinner && <span className="text-green-600">👑</span>}
                            {isEliminated && <span className="text-red-600">❌</span>}
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isWinner ? 'bg-green-500' :
                                isEliminated ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${Math.max(parseFloat(percentage), 2)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {round.winner && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 <strong>{getContestantName(round.winner)}</strong> won with {round.votes[round.winner]} votes 
                    ({getVotePercentage(round.votes[round.winner], round.totalVotes)}%), reaching the majority threshold of {majority} votes.
                  </p>
                </div>
              )}
              
              {round.eliminated && !round.winner && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>{getContestantName(round.eliminated)}</strong> was eliminated with {round.votes[round.eliminated]} votes 
                    ({getVotePercentage(round.votes[round.eliminated], round.totalVotes)}%). 
                    Their votes will be redistributed in the next round.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* How RCV Works */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How Ranked-Choice Voting Works</h3>
        <div className="text-blue-700 space-y-2 text-sm">
          <p>• Voters rank candidates in order of preference (1st choice, 2nd choice, etc.)</p>
          <p>• To win, a candidate needs more than 50% of the votes (majority)</p>
          <p>• If no one gets a majority, the candidate with the fewest votes is eliminated</p>
          <p>• Votes for the eliminated candidate go to voters&apos; next choices</p>
          <p>• This process repeats until someone reaches a majority</p>
        </div>
      </div>
    </div>
  )
}