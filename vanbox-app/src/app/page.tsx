'use client'

import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Download, LogOut, ChevronDown, Trash2, X } from 'lucide-react'

interface Entry {
  id: string
  content: string
  created_at_user_tz: string
  created_at_utc: string
}

// Simple User Icon Component
const UserIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
)

// Confirmation Modal Component
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MainApp() {
  const { user, loading, signOut } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null
  })
  const [isDeleting, setIsDeleting] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const maxChars = 5000
  const currentChars = content.length
  const isOverLimit = currentChars > maxChars
  const isButtonDisabled = content.trim() === '' || isOverLimit || isSaving

  const supabase = createClient()

  const loadEntries = useCallback(async () => {
    if (!user) return

    setIsLoadingEntries(true)
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, content, created_at_user_tz, created_at_utc')
        .eq('user_id', user.id)
        .order('created_at_utc', { ascending: false })
        .limit(20) // Show latest 20 entries

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Load entries error:', error)
      showToast('Failed to load history.', 'error')
    } finally {
      setIsLoadingEntries(false)
    }
  }, [user, showToast])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadEntries()
    }
  }, [user, loading, router, loadEntries])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSaveNote = async () => {
    if (isButtonDisabled || !user) return

    setIsSaving(true)
    try {
      const now = new Date()
      const localTimestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const { error } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          content: content.trim(),
          created_at_user_tz: localTimestamp
        })

      if (error) throw error

      setContent('')
      showToast('Note saved!', 'success')
      loadEntries() // Refresh the list
    } catch (error) {
      console.error('Save error:', error)
      showToast('Error: Could not save note. Please try again.', 'error', 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    setDeleteModal({ isOpen: true, entryId })
  }

  const confirmDelete = async () => {
    if (!deleteModal.entryId || !user) return

    setIsDeleting(true)
    try {
      const { data, error } = await supabase
        .from('entries')
        .delete()
        .eq('id', deleteModal.entryId)
        .eq('user_id', user.id) // Safeguard, RLS is the primary security
        .select() // Ask Supabase to return the deleted row

      if (error) {
        // Handle potential errors from the API call
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        // This is key: if data is empty, it means no row was deleted.
        // This is often due to RLS policies blocking the operation.
        throw new Error("Deletion failed. Please check permissions or try again.")
      }

      showToast('Note deleted successfully', 'success')
      setDeleteModal({ isOpen: false, entryId: null })
      // Optimistically remove the entry from the UI
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== deleteModal.entryId))

    } catch (error) {
      console.error('Delete error:', error)
      showToast(error instanceof Error ? error.message : 'Failed to delete note.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadData = async () => {
    if (!user) return

    setIsDownloading(true)
    try {
      const { data: entries, error } = await supabase
        .from('entries')
        .select('content, created_at_user_tz')
        .eq('user_id', user.id)
        .order('created_at_utc', { ascending: true })

      if (error) throw error

      if (!entries || entries.length === 0) {
        showToast('No data to download.', 'error')
        return
      }

      // Generate Markdown content
      const markdownContent = entries
        .map(entry => `---\nDate: ${entry.created_at_user_tz}\n---\n\n${entry.content}`)
        .join('\n\n')

      // Create and download file
      const blob = new Blob([markdownContent], { type: 'text/markdown; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const now = new Date()
      const filename = `vanbox_export_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.md`
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('Data download started.', 'success')
      setShowUserMenu(false)
    } catch (error) {
      console.error('Download error:', error)
      showToast('Error downloading data.', 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      showToast('Error signing out. Please try again.', 'error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSaveNote()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Vanbox
              </h2>
            </div>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100/70 transition-colors"
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="User avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                      {user.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="User avatar"
                          className="w-10 h-10 rounded-full ring-2 ring-blue-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleDownloadData}
                    disabled={isDownloading}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Downloading...' : 'Download Data'}
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/70 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              id="vanbox-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              rows={1}
              maxLength={maxChars + 100} // Allow typing past limit to show error state
              className={`w-full resize-none border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors min-h-[3rem] bg-white/50 ${
                isOverLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200'
              }`}
              style={{ overflow: 'hidden' }}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Press Ctrl+Enter (⌘+Enter) to save quickly
              </div>
              
              <div className={`text-sm font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {currentChars} / {maxChars}
              </div>
            </div>
            
            <button
              id="vanbox-submit"
              onClick={handleSaveNote}
              disabled={isButtonDisabled}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          {isLoadingEntries ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading your notes...</p>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 text-lg">No notes yet</p>
              <p className="text-gray-400 text-sm mt-1">Start writing your first note above!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-200 group relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-gray-500 font-medium bg-gray-100/70 px-3 py-1 rounded-full">
                    {entry.created_at_user_tz}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="opacity-60 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-red-200"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, entryId: null })}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />

      {/* Loading overlay for delete action */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
            <p className="text-gray-700">Deleting note...</p>
          </div>
        </div>
      )}
    </div>
  )
}
