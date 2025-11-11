import { useState, useEffect } from 'react'

/**
 * Custom hook to add loading timeout for skeleton states
 * Automatically stops loading after a specified timeout
 */
const useLoadingTimeout = (initialLoading = true, timeoutMs = 5000) => {
  const [loading, setLoading] = useState(initialLoading)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) return

    const timeout = setTimeout(() => {
      setLoading(false)
      setHasTimedOut(true)
    }, timeoutMs)

    return () => clearTimeout(timeout)
  }, [loading, timeoutMs])

  const resetLoading = () => {
    setLoading(true)
    setHasTimedOut(false)
  }

  const stopLoading = () => {
    setLoading(false)
  }

  return {
    loading,
    hasTimedOut,
    resetLoading,
    stopLoading
  }
}

export default useLoadingTimeout
