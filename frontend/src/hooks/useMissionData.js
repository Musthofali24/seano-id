import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'
import axios from '../utils/axiosConfig'

const useMissionData = () => {
  const [missionData, setMissionData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchMissionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use axios with config
      const response = await axios.get(API_ENDPOINTS.MISSIONS.LIST)
      const data = response.data

      // Pastikan data adalah array
      const missionsArray = Array.isArray(data) ? data : data.data || []

      // Transform data jika perlu
      const transformedData = missionsArray.map(mission => ({
        id: mission.id || Math.random(),
        name: mission.name || mission.title || 'Unnamed Mission',
        title: mission.name || mission.title || 'Unnamed Mission',
        vehicle: mission.vehicle_name || mission.vehicle || 'Unknown Vehicle',
        progress: Math.min(100, Math.max(0, mission.progress || 0)),
        status: mission.status || 'Unknown',
        statusColor: getStatusColor(mission.status),
        startTime:
          mission.start_time || mission.created_at || new Date().toISOString(),
        start_time: mission.start_time,
        created_at: mission.created_at,
        endTime: mission.end_time,
        waypoints: mission.waypoints || [],
        home_location: mission.home_location || null,
        total_waypoints: Array.isArray(mission.waypoints)
          ? mission.waypoints.length
          : 0,
        current_waypoint:
          mission.current_waypoint || mission.completed_waypoints || 0,
        distance: mission.distance || 0,
        duration: mission.duration || 0
      }))

      setMissionData(transformedData)
      setLastUpdated(new Date())
    } catch {
      setError('Failed to load mission data')
      setMissionData([])
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  // Helper function untuk menentukan warna status
  const getStatusColor = status => {
    if (!status) return 'gray'

    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'running':
      case 'in_progress':
        return 'green'
      case 'completed':
      case 'finished':
      case 'success':
        return 'blue'
      case 'paused':
      case 'pending':
        return 'yellow'
      case 'failed':
      case 'error':
      case 'cancelled':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Fetch data saat hook pertama kali dimuat
  useEffect(() => {
    fetchMissionData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Function untuk manual refresh
  const refreshData = () => {
    fetchMissionData()
  }

  // Function untuk create mission
  const createMission = async missionData => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.MISSIONS.CREATE,
        missionData
      )
      await fetchMissionData() // Refresh data
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Function untuk update mission
  const updateMission = async (id, missionData) => {
    try {
      console.log('🚀 updateMission called:', { id, missionData })
      console.log('📍 API URL:', API_ENDPOINTS.MISSIONS.UPDATE(id))

      const response = await axios.put(
        API_ENDPOINTS.MISSIONS.UPDATE(id),
        missionData
      )

      console.log('✅ Update success:', response.data)
      await fetchMissionData() // Refresh data
      return response.data
    } catch (error) {
      console.error('❌ Update failed:', error)
      console.error('Error details:', error.response?.data)
      throw error
    }
  }

  // Function untuk delete mission
  const deleteMission = async id => {
    try {
      await axios.delete(API_ENDPOINTS.MISSIONS.DELETE(id))
      await fetchMissionData() // Refresh data
    } catch (error) {
      throw error
    }
  }

  // Function untuk mendapatkan recent missions (limit 5)
  const getRecentMissions = (limit = 5) => {
    return missionData
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit)
  }

  // Function untuk mendapatkan active missions
  const getActiveMissions = () => {
    return missionData.filter(mission =>
      ['active', 'running', 'in_progress'].includes(
        mission.status.toLowerCase()
      )
    )
  }

  // Function untuk mendapatkan completed missions
  const getCompletedMissions = () => {
    return missionData.filter(mission =>
      ['completed', 'finished', 'success'].includes(
        mission.status.toLowerCase()
      )
    )
  }

  // Function untuk mendapatkan failed missions
  const getFailedMissions = () => {
    return missionData.filter(mission =>
      ['failed', 'error', 'cancelled'].includes(mission.status.toLowerCase())
    )
  }

  // Function untuk analytics per vehicle
  const getVehicleAnalytics = () => {
    const vehicleStats = {}

    missionData.forEach(mission => {
      const vehicle = mission.vehicle || 'Unknown Vehicle'

      if (!vehicleStats[vehicle]) {
        vehicleStats[vehicle] = {
          total: 0,
          completed: 0,
          failed: 0,
          active: 0
        }
      }

      vehicleStats[vehicle].total++

      const status = mission.status.toLowerCase()
      if (['completed', 'finished', 'success'].includes(status)) {
        vehicleStats[vehicle].completed++
      } else if (['failed', 'error', 'cancelled'].includes(status)) {
        vehicleStats[vehicle].failed++
      } else if (['active', 'running', 'in_progress'].includes(status)) {
        vehicleStats[vehicle].active++
      }
    })

    return Object.entries(vehicleStats).map(([vehicle, stats]) => ({
      vehicle,
      ...stats,
      successRate:
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }))
  }

  // Statistics
  const stats = {
    total: missionData.length,
    active: getActiveMissions().length,
    completed: getCompletedMissions().length,
    totalDistance: missionData.reduce(
      (sum, mission) => sum + (mission.distance || 0),
      0
    ),
    totalDuration: missionData.reduce(
      (sum, mission) => sum + (mission.duration || 0),
      0
    ),
    averageProgress:
      missionData.length > 0
        ? Math.round(
            missionData.reduce((sum, mission) => sum + mission.progress, 0) /
              missionData.length
          )
        : 0
  }

  return {
    missionData,
    loading,
    error,
    lastUpdated,
    fetchMissionData,
    refreshData,
    createMission,
    updateMission,
    deleteMission,
    getRecentMissions,
    getActiveMissions,
    getCompletedMissions,
    getFailedMissions,
    getVehicleAnalytics,
    stats
  }
}

export default useMissionData
