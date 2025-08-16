'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ResultsVisualization from '@/components/ResultsVisualization'

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

interface ResultsData {
  results: RCVResult | null
  contestants: Contestant[]
  totalVotes: number
  message?: string
}

export default function ResultsPage() {
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchResults()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      if (response.ok) {
        const resultsData = await response.json()
        setData(resultsData)
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Results</h1>
              <p className="text-gray-600">Ranked-choice voting results updated in real-time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh:</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={fetchResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Refresh Now
              </button>
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Voting
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data?.message ? (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 font-medium">{data.message}</p>
              <p className="text-yellow-700 text-sm mt-2">
                Results will appear here once voting begins.
              </p>
            </div>
          </div>
        ) : data?.results ? (
          <ResultsVisualization
            results={data.results}
            contestants={data.contestants}
            totalVotes={data.totalVotes}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No results available.</p>
          </div>
        )}
      </main>
    </div>
  )
}