import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface AuthCodeErrorProps {
  searchParams: {
    error?: string
    description?: string
  }
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const { error, description } = searchParams
  
  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'You cancelled the authentication process. Please try again if you want to sign in.'
      case 'session_exchange_failed':
        return 'Failed to establish your session. This usually happens on the first login attempt. Please try again.'
      case 'no_session':
        return 'No session was created. Please try signing in again.'
      case 'unexpected_error':
        return 'An unexpected error occurred during authentication. Please try again.'
      default:
        return 'There was an error signing you in. This is common on the first attempt. Please try again.'
    }
  }

  const getErrorTitle = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Authentication Cancelled'
      case 'session_exchange_failed':
        return 'Session Setup Failed'
      case 'no_session':
        return 'No Session Created'
      case 'unexpected_error':
        return 'Unexpected Error'
      default:
        return 'Authentication Error'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {getErrorTitle(error)}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {getErrorMessage(error)}
            </p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded">
                Technical details: {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin" className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Common causes:</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• First-time login attempts may fail initially</li>
            <li>• Browser popup blockers can interfere</li>
            <li>• Network connectivity issues</li>
            <li>• OAuth state parameter mismatches</li>
          </ul>
          <p className="text-center mt-3">
            If the problem persists, try clearing your browser cache and cookies.
          </p>
        </div>
      </div>
    </div>
  )
}
