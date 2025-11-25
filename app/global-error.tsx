"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #f1f5f9, #dbeafe, #e0e7ff)',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '32rem',
            width: '100%',
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Application Error
            </h2>
            <p style={{
              color: '#64748b',
              marginBottom: '1.5rem'
            }}>
              Something went wrong! Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                width: '100%',
                background: 'white',
                color: '#0f172a',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
