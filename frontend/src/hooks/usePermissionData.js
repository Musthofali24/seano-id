import { useState, useEffect } from 'react'

const usePermissionData = () => {
  const [permissionData, setPermissionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stats derived from permission data
  const getPermissionStats = () => {
    const total = permissionData.length

    // Permission types based on common patterns
    const readPermissions = permissionData.filter(
      permission =>
        permission.name?.toLowerCase().includes('read') ||
        permission.name?.toLowerCase().includes('view') ||
        permission.name?.toLowerCase().includes('get')
    ).length

    const writePermissions = permissionData.filter(
      permission =>
        permission.name?.toLowerCase().includes('write') ||
        permission.name?.toLowerCase().includes('create') ||
        permission.name?.toLowerCase().includes('update') ||
        permission.name?.toLowerCase().includes('edit')
    ).length

    const deletePermissions = permissionData.filter(
      permission =>
        permission.name?.toLowerCase().includes('delete') ||
        permission.name?.toLowerCase().includes('remove')
    ).length

    // Recent permissions (created in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recent = permissionData.filter(permission => {
      if (!permission.created_at) return false
      const createdDate = new Date(permission.created_at)
      return createdDate >= sevenDaysAgo
    }).length

    // Permissions with descriptions
    const withDescription = permissionData.filter(
      permission =>
        permission.description && permission.description.trim().length > 0
    ).length

    return {
      total,
      recent,
      readPermissions,
      writePermissions,
      deletePermissions,
      withDescription,
      withoutDescription: total - withDescription
    }
  }

  // Fetch permission data
  const fetchPermissionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/permissions');
      // const data = await response.json();
      // setPermissionData(data);

      // For now, set empty array - will be populated by actual API
      setPermissionData([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new permission
  const addPermission = async permissionData => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/permissions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(permissionData)
      // });
      // const newPermission = await response.json();

      // For demo: create a new permission with current timestamp
      const newPermission = {
        id: Date.now(),
        name: permissionData.name,
        description: permissionData.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setPermissionData(prev => [newPermission, ...prev])

      return { success: true, message: 'Permission added successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Update permission
  const updatePermission = async (id, updatedData) => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch(`/api/permissions/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      // const updatedPermission = await response.json();

      // For demo: update the permission in local state
      setPermissionData(prev =>
        prev.map(permission =>
          permission.id === id
            ? {
                ...permission,
                ...updatedData,
                updated_at: new Date().toISOString()
              }
            : permission
        )
      )

      return { success: true, message: 'Permission updated successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete permission
  const deletePermission = async id => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // await fetch(`/api/permissions/${id}`, { method: 'DELETE' });

      // For demo: remove from local state
      setPermissionData(prev => prev.filter(permission => permission.id !== id))

      return { success: true, message: 'Permission deleted successfully!' }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissionData()
  }, [])

  const stats = getPermissionStats()

  return {
    permissionData,
    loading,
    error,
    stats,
    actions: {
      addPermission,
      updatePermission,
      deletePermission,
      refreshData: fetchPermissionData
    }
  }
}

export default usePermissionData
