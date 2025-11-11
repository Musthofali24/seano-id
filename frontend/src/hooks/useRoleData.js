import { useState, useEffect } from 'react'

const useRoleData = () => {
  const [roleData, setRoleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stats derived from role data
  const getRoleStats = () => {
    const total = roleData.length

    // Most common description length
    const descriptionLengths = roleData.map(role =>
      role.description ? role.description.length : 0
    )
    const avgDescLength =
      descriptionLengths.length > 0
        ? Math.round(
            descriptionLengths.reduce((a, b) => a + b, 0) /
              descriptionLengths.length
          )
        : 0

    // Recent roles (created in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recent = roleData.filter(role => {
      if (!role.created_at) return false
      const createdDate = new Date(role.created_at)
      return createdDate >= sevenDaysAgo
    }).length

    // Roles with descriptions
    const withDescription = roleData.filter(
      role => role.description && role.description.trim().length > 0
    ).length

    return {
      total,
      recent,
      withDescription,
      withoutDescription: total - withDescription,
      avgDescLength
    }
  }

  // Fetch role data
  const fetchRoleData = async () => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoleData(data);

      // For now, set empty array - will be populated by actual API
      setRoleData([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new role
  const addRole = async roleData => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/roles', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(roleData)
      // });
      // const newRole = await response.json();

      // For demo: create a new role with current timestamp
      const newRole = {
        id: Date.now(),
        name: roleData.name,
        description: roleData.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setRoleData(prev => [newRole, ...prev])

      return { success: true, message: 'Role added successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Update role
  const updateRole = async (id, updatedData) => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch(`/api/roles/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      // const updatedRole = await response.json();

      // For demo: update the role in local state
      setRoleData(prev =>
        prev.map(role =>
          role.id === id
            ? {
                ...role,
                ...updatedData,
                updated_at: new Date().toISOString()
              }
            : role
        )
      )

      return { success: true, message: 'Role updated successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete role
  const deleteRole = async id => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // await fetch(`/api/roles/${id}`, { method: 'DELETE' });

      // For demo: remove from local state
      setRoleData(prev => prev.filter(role => role.id !== id))

      return { success: true, message: 'Role deleted successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoleData()
  }, [])

  const stats = getRoleStats()

  return {
    roleData,
    loading,
    error,
    stats,
    actions: {
      addRole,
      updateRole,
      deleteRole,
      refreshData: fetchRoleData
    }
  }
}

export default useRoleData
