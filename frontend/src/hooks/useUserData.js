import { useState, useEffect } from 'react'

const useUserData = () => {
  const [userData, setUserData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stats derived from user data
  const getUserStats = () => {
    const total = userData.length
    const active = userData.filter(user => user.is_active).length
    const inactive = total - active

    // Email domain distribution
    const domainCounts = userData.reduce((acc, user) => {
      if (user.email) {
        const domain = user.email.split('@')[1] || 'unknown'
        acc[domain] = (acc[domain] || 0) + 1
      }
      return acc
    }, {})

    const topDomain = Object.entries(domainCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]

    return {
      total,
      active,
      inactive,
      topDomain: topDomain ? topDomain[0] : 'N/A',
      activeRate: total > 0 ? ((active / total) * 100).toFixed(1) : '0'
    }
  }

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/users');
      // const data = await response.json();
      // setUserData(data);

      // For now, set empty array - will be populated by actual API
      setUserData([])
    } catch (err) {
      setError(err.message)
      setUserData([])
    } finally {
      setLoading(false)
    }
  }

  // Add new user
  const addUser = async userData => {
    try {
      // API call would go here
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const newUser = await response.json();

      // For now, simulate adding to local state
      const newUser = {
        id: Date.now(),
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setUserData(prev => [...prev, newUser])
      return { success: true, data: newUser }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      // API call would go here
      // const response = await fetch(`/api/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const updatedUser = await response.json();

      // For now, simulate updating local state
      setUserData(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, ...userData, updated_at: new Date().toISOString() }
            : user
        )
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Delete user
  const deleteUser = async userId => {
    try {
      // API call would go here
      // await fetch(`/api/users/${userId}`, { method: 'DELETE' });

      // For now, simulate removing from local state
      setUserData(prev => prev.filter(user => user.id !== userId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Refresh data
  const refreshData = () => {
    fetchUserData()
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return {
    userData,
    loading,
    error,
    stats: getUserStats(),
    actions: {
      addUser,
      updateUser,
      deleteUser,
      refreshData
    }
  }
}

export default useUserData
