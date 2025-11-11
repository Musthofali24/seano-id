import { useState } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config'

const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login function
  const login = async (email, password) => {
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      })

      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      return { success: true, data: res.data }
    } catch (err) {
      console.error(err)
      let errorMessage = 'Something went wrong. Please try again.'

      if (err.response?.status === 401) {
        errorMessage = err.response.data.detail || 'Invalid credentials.'
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Register email function
  const registerEmail = async email => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message:
            data.message || 'Verification link has been sent to your email'
        }
      } else {
        setError(data.detail || 'Failed to register email')
        return {
          success: false,
          error: data.detail || 'Failed to register email'
        }
      }
    } catch (err) {
      console.error(err)
      const errorMessage = 'Server error. Please try again later.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verify email function
  const verifyEmail = async token => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await res.json()

      if (res.ok) {
        return {
          success: true,
          message: data.message || 'Email verified successfully!',
          token: data.set_credentials_token
        }
      } else {
        setError(data.detail || 'Verification failed')
        return {
          success: false,
          error: data.detail || 'Verification failed'
        }
      }
    } catch (err) {
      console.error(err)
      const errorMessage = 'Server error. Please try again later.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Set credentials function
  const setCredentials = async (token, username, password) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.SET_CREDENTIALS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          username,
          password
        })
      })

      const data = await res.json()

      if (res.ok) {
        return {
          success: true,
          message: 'Account activated successfully! Redirecting...'
        }
      } else {
        setError(data.detail || 'Activation failed. Please try again.')
        return {
          success: false,
          error: data.detail || 'Activation failed. Please try again.'
        }
      }
    } catch (err) {
      console.error(err)
      const errorMessage = 'Server error. Please try again later.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (err) {
      console.error('Error parsing user data:', err)
      return null
    }
  }

  // Check if authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token')
  }

  return {
    loading,
    error,
    login,
    registerEmail,
    verifyEmail,
    setCredentials,
    logout,
    getCurrentUser,
    isAuthenticated
  }
}

export default useAuth
