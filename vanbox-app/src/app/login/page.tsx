'use client'

import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
      showToast(
        error instanceof Error ? error.message : 'Login failed. Please try again.',
        'error'
      )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col relative">
      {/* Main Content - Centered with top margin */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 pt-16">
        <div className="text-center max-w-md mx-auto">
          {/* Logo using your custom image */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/icons/icon-192x192.png"
                alt="Vanbox Logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Title and Description */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Vanbox
          </h1>
          <p className="text-2xl text-gray-600 mb-3">Your personal text capsule</p>
          <p className="text-lg text-gray-500 mb-12">
            Capture your thoughts instantly, anywhere
          </p>
        </div>
      </div>

      {/* Login Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 px-4 bg-gradient-to-t from-blue-50/80 to-transparent backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our secure, privacy-focused approach
          </p>
        </div>
      </div>
    </div>
  )
} 