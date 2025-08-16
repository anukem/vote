'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

interface Contestant {
  id: number
  name: string
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function AdminPanel() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  })
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth')
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    } catch {
      setIsAuthenticated(false)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
      fetchContestants()
    }
  }, [isAuthenticated])


  const fetchContestants = async () => {
    try {
      const response = await fetch('/api/contestants')
      if (response.ok) {
        const data = await response.json()
        setContestants(data)
      }
    } catch {
      toast.error('Failed to fetch contestants')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      router.push('/admin/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      const url = editingContestant ? `/api/contestants/${editingContestant.id}` : '/api/contestants'
      const method = editingContestant ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingContestant ? 'Contestant updated!' : 'Contestant added!')
        setFormData({ name: '', description: '', imageUrl: '' })
        setEditingContestant(null)
        setShowAddForm(false)
        fetchContestants()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleEdit = (contestant: Contestant) => {
    setEditingContestant(contestant)
    setFormData({
      name: contestant.name,
      description: contestant.description || '',
      imageUrl: contestant.imageUrl || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contestant? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Contestant deleted!')
        fetchContestants()
      } else {
        toast.error('Failed to delete contestant')
      }
    } catch {
      toast.error('Failed to delete contestant')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', imageUrl: '' })
    setEditingContestant(null)
    setShowAddForm(false)
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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage contestants and view voting statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/results" className="text-blue-600 hover:text-blue-800 font-medium">
                View Results
              </Link>
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Voting Page
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form */}
        <div className="mb-8">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add New Contestant
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingContestant ? 'Edit Contestant' : 'Add New Contestant'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    {editingContestant ? 'Update' : 'Add'} Contestant
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Contestants List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Contestants ({contestants.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {contestants.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No contestants added yet. Add your first contestant above.
              </div>
            ) : (
              contestants.map((contestant) => (
                <div key={contestant.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {contestant.imageUrl && (
                      <Image
                        src={contestant.imageUrl}
                        alt={contestant.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{contestant.name}</h3>
                      {contestant.description && (
                        <p className="text-sm text-gray-600">{contestant.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(contestant)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contestant.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}