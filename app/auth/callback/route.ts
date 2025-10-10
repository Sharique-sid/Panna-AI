import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/dashboard"
  const isExtension = searchParams.get("extension") === "true"

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    if (isExtension) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: '${error}: ${errorDescription || 'Authentication failed'}'
              }, '${origin}');
              window.close();
            } else {
              document.body.innerHTML = '<h1>Authentication failed: ${error}</h1>';
            }
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Session exchange error:", error)
        if (isExtension) {
          return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authentication Error</title>
            </head>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_ERROR',
                    error: 'Session exchange failed: ${error.message}'
                  }, '${origin}');
                  window.close();
                } else {
                  document.body.innerHTML = '<h1>Session exchange failed</h1>';
                }
              </script>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' },
          })
        }
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=session_exchange_failed&description=${encodeURIComponent(error.message)}`)
      }
      
      if (!data.session) {
        console.error("No session returned from exchange")
        if (isExtension) {
          return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authentication Error</title>
            </head>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_ERROR',
                    error: 'No session returned from authentication'
                  }, '${origin}');
                  window.close();
                } else {
                  document.body.innerHTML = '<h1>No session returned</h1>';
                }
              </script>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' },
          })
        }
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session&description=No session returned from authentication`)
      }
      
        if (isExtension) {
          // For extension, return a page that sends the session back to the extension
          return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authentication Complete</title>
            </head>
            <body>
              <script>
                console.log('Auth callback page loaded');
                console.log('Session data:', ${JSON.stringify({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                  user: {
                    id: data.session.user.id,
                    email: data.session.user.email,
                    name: data.session.user.user_metadata?.full_name || data.session.user.email
                  }
                })});
                
                // Send the session back to the extension
                if (window.opener) {
                  console.log('Sending message to opener');
                  const sessionData = {
                    access_token: '${data.session.access_token}',
                    refresh_token: '${data.session.refresh_token}',
                    user: {
                      id: '${data.session.user.id}',
                      email: '${data.session.user.email}',
                      name: '${data.session.user.user_metadata?.full_name || data.session.user.email}'
                    }
                  };
                  
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    session: sessionData
                  }, '${origin}');
                  
                  console.log('Message sent, closing window');
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                } else {
                  console.log('No opener found');
                  document.body.innerHTML = '<h1>Authentication successful! You can close this window.</h1>';
                }
              </script>
            </body>
            </html>
          `, {
            headers: {
              'Content-Type': 'text/html',
            },
          })
        } else {
          // Normal web app flow
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (error: any) {
      console.error("Unexpected error in auth callback:", error)
      if (isExtension) {
        return new NextResponse(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: 'Unexpected error: ${error.message}'
                }, '${origin}');
                window.close();
              } else {
                document.body.innerHTML = '<h1>Unexpected error occurred</h1>';
              }
            </script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        })
      }
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error&description=${encodeURIComponent(error.message)}`)
    }
  }

  if (isExtension) {
    // For extension, return an error page that sends error back to extension
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Authentication failed'
            }, '${origin}');
            window.close();
          } else {
            document.body.innerHTML = '<h1>Authentication failed. You can close this window.</h1>';
          }
        </script>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
