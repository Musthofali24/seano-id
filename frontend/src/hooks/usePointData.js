import { useState, useEffect } from 'react'

const usePointData = () => {
  const [pointData, setPointData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stats derived from point data
  const getPointStats = () => {
    const total = pointData.length
    const active = pointData.filter(point => point.is_active).length
    const inactive = total - active

    // Region distribution
    const regionCounts = pointData.reduce((acc, point) => {
      const region = getRegionFromCoordinates(point.latitude, point.longitude)
      acc[region] = (acc[region] || 0) + 1
      return acc
    }, {})

    const topRegion = Object.entries(regionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]

    return {
      total,
      active,
      inactive,
      topRegion: topRegion ? topRegion[0] : 'N/A',
      coverage: total > 0 ? ((active / total) * 100).toFixed(1) : '0'
    }
  }

  function getRegionFromCoordinates (lat, lng) {
    if (!lat || !lng) return 'Unknown'
    // Simple region detection based on coordinates (Indonesia regions)
    if (lat >= -6.5 && lat <= -5.5 && lng >= 106.5 && lng <= 107.5)
      return 'Jakarta'
    if (lat >= -7.5 && lat <= -6.5 && lng >= 107 && lng <= 108.5)
      return 'West Java'
    if (lat >= -8 && lat <= -7 && lng >= 110 && lng <= 111.5)
      return 'Central Java'
    if (lat >= -8.5 && lat <= -7.5 && lng >= 112 && lng <= 114.5)
      return 'East Java'
    return 'Other Region'
  }

  // Fetch point data
  const fetchPointData = async () => {
    try {
      setLoading(true)
      setError(null)

      // API call would go here
      // const response = await fetch('/api/points');
      // const data = await response.json();
      // setPointData(data);

      // For now, set empty array - will be populated by actual API
      setPointData([])
    } catch (err) {
      setError(err.message)
      setPointData([])
    } finally {
      setLoading(false)
    }
  }

  // Add new point
  const addPoint = async pointData => {
    try {
      // API call would go here
      // const response = await fetch('/api/points', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pointData)
      // });
      // const newPoint = await response.json();

      // For now, simulate adding to local state
      const newPoint = {
        id: Date.now(),
        ...pointData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setPointData(prev => [...prev, newPoint])
      return { success: true, data: newPoint }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Update point
  const updatePoint = async (pointId, pointData) => {
    try {
      // API call would go here
      // const response = await fetch(`/api/points/${pointId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pointData)
      // });
      // const updatedPoint = await response.json();

      // For now, simulate updating local state
      setPointData(prev =>
        prev.map(point =>
          point.id === pointId
            ? { ...point, ...pointData, updated_at: new Date().toISOString() }
            : point
        )
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Delete point
  const deletePoint = async pointId => {
    try {
      // API call would go here
      // await fetch(`/api/points/${pointId}`, { method: 'DELETE' });

      // For now, simulate removing from local state
      setPointData(prev => prev.filter(point => point.id !== pointId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Refresh data
  const refreshData = () => {
    fetchPointData()
  }

  useEffect(() => {
    fetchPointData()
  }, [])

  return {
    pointData,
    loading,
    error,
    stats: getPointStats(),
    actions: {
      addPoint,
      updatePoint,
      deletePoint,
      refreshData
    }
  }
}

export default usePointData
