'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

// 1. Move the logic into a separate internal component
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link is invalid or has expired.',
    OAuthSignin: 'Error signing in with OAuth provider.',
    OAuthCallback: 'Error handling OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error during callback.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignin: 'Error sending email.',
    CredentialsSignin: 'Invalid email or password.',
    Default: 'An authentication error occurred.',
  }

  const displayMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center font-display text-3xl font-bold text-gray-900">
          Authentication Error
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          {displayMessage}
        </p>

        {error === 'CredentialsSignin' && (
          <p className="mt-1 text-center text-xs text-gray-500">
            Please check your email and password and try again.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-primary hover:text-primary/80">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. Export the page wrapped in Suspense
export default function AuthErrorPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}