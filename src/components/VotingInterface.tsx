'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'

interface Contestant {
  id: number
  name: string
  description?: string
  imageUrl?: string
}

interface RankedContestant extends Contestant {
  rank: number
}

interface VotingInterfaceProps {
  contestants: Contestant[]
  onVoteSubmit: (rankings: { contestantId: number; rank: number }[]) => Promise<void>
  hasVoted: boolean
}

function SortableItem({ contestant, rank }: { contestant: Contestant; rank: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contestant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-move ${
        isDragging ? 'opacity-50 border-blue-500' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
          {rank}
        </div>
        {contestant.imageUrl && (
          <Image
            src={contestant.imageUrl}
            alt={contestant.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{contestant.name}</h3>
          {contestant.description && (
            <p className="text-sm text-gray-600">{contestant.description}</p>
          )}
        </div>
        <div className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function VotingInterface({ contestants, onVoteSubmit, hasVoted }: VotingInterfaceProps) {
  const [rankedContestants, setRankedContestants] = useState<RankedContestant[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (contestants.length > 0) {
      setRankedContestants(
        contestants.map((contestant, index) => ({
          ...contestant,
          rank: index + 1,
        }))
      )
    }
  }, [contestants])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setRankedContestants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        return newItems.map((item, index) => ({
          ...item,
          rank: index + 1,
        }))
      })
    }

    setActiveId(null)
  }

  const handleSubmitVote = async () => {
    if (rankedContestants.length === 0) {
      toast.error('No contestants to vote for')
      return
    }

    setIsSubmitting(true)
    try {
      const rankings = rankedContestants.map((contestant) => ({
        contestantId: contestant.id,
        rank: contestant.rank,
      }))

      await onVoteSubmit(rankings)
      toast.success('Your vote has been submitted!')
    } catch {
      toast.error('Failed to submit vote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasVoted) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">Thank you for voting!</p>
          <p>You have already submitted your vote for this talent show.</p>
        </div>
      </div>
    )
  }

  if (contestants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No contestants available for voting yet.</p>
      </div>
    )
  }

  const activeContestant = rankedContestants.find((contestant) => contestant.id === activeId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rank the Contestants</h2>
        <p className="text-gray-600">
          Drag and drop the contestants to rank them in order of preference. 
          Your #1 choice should be at the top.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rankedContestants.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-6">
            {rankedContestants.map((contestant) => (
              <SortableItem
                key={contestant.id}
                contestant={contestant}
                rank={contestant.rank}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeContestant ? (
            <SortableItem contestant={activeContestant} rank={activeContestant.rank} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-center">
        <button
          onClick={handleSubmitVote}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Your Vote'}
        </button>
      </div>
    </div>
  )
}