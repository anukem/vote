'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VotingInterface from '@/components/VotingInterface'
import { Toaster } from 'react-hot-toast'

interface Contestant {
  id: number
  name: string
  description?: string
  imageUrl?: string
}

export default function Home() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContestants()
    checkVoteStatus()
  }, [])

  const fetchContestants = async () => {
    try {
      const response = await fetch('/api/contestants')
      if (response.ok) {
        const data = await response.json()
        setContestants(data)
      }
    } catch (error) {
      console.error('Failed to fetch contestants:', error)
    }
  }

  const checkVoteStatus = async () => {
    try {
      const response = await fetch('/api/vote')
      if (response.ok) {
        const data = await response.json()
        setHasVoted(data.hasVoted)
      }
    } catch (error) {
      console.error('Failed to check vote status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteSubmit = async (rankings: { contestantId: number; rank: number }[]) => {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rankings }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit vote')
    }

    setHasVoted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">The Annual Anukem Talent Show</h1>
              <p className="text-gray-600">Cast your ranked-choice vote for your favorite performers</p>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VotingInterface
          contestants={contestants}
          onVoteSubmit={handleVoteSubmit}
          hasVoted={hasVoted}
        />
      </main>
    </div>
  )
}
