import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '../config'

const useVehicleData = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

  useEffect(() => {
    let loadingTimeout

    loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    const fetchVehicles = async () => {
      try {
        setLoading(true)

        // Get token from localStorage
        const token = localStorage.getItem('access_token')

        const response = await fetch(`${API_BASE_URL}/vehicles/`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            : {
                'Content-Type': 'application/json'
              }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Process and validate API data
        const processedVehicles = Array.isArray(data)
          ? data.map(vehicle => ({
              id: vehicle.id,
              name: vehicle.name || `Vehicle ${vehicle.id}`,
              code:
                vehicle.code || `USV-${String(vehicle.id).padStart(3, '0')}`,
              type: vehicle.type || 'USV',
              role: vehicle.role || 'Patrol',
              status: vehicle.status || 'offline',
              battery_level: vehicle.battery_level || 0,
              latitude: vehicle.latitude || null,
              longitude: vehicle.longitude || null,
              created_at: vehicle.created_at || new Date().toISOString()
            }))
          : []

        // Only update state if data actually changed
        setVehicles(prevVehicles => {
          const hasChanged =
            JSON.stringify(prevVehicles) !== JSON.stringify(processedVehicles)
          return hasChanged ? processedVehicles : prevVehicles
        })
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        // Set empty array on error instead of dummy data
        setVehicles([])
      } finally {
        setLoading(false)
        // Clear loading timeout since we got a response
        if (loadingTimeout) clearTimeout(loadingTimeout)
      }
    }

    // Fetch only once on mount - WebSocket will handle real-time updates
    fetchVehicles()

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout)
    }
  }, [])

  // Calculate widget data with useMemo to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    const vehiclesToday = vehicles.filter(v => v.created_at.startsWith(today))
    const vehiclesYesterday = vehicles.filter(v =>
      v.created_at.startsWith(yesterday)
    )

    const totalToday = vehiclesToday.length
    const totalYesterday = vehiclesYesterday.length

    const onMissionToday = vehiclesToday.filter(
      v => v.status === 'on_mission'
    ).length
    const onMissionYesterday = vehiclesYesterday.filter(
      v => v.status === 'on_mission'
    ).length

    const onlineToday = vehiclesToday.filter(
      v => v.status === 'idle' || v.status === 'on_mission'
    ).length
    const onlineYesterday = vehiclesYesterday.filter(
      v => v.status === 'idle' || v.status === 'on_mission'
    ).length

    const offlineToday = vehiclesToday.filter(
      v => v.status === 'offline'
    ).length
    const offlineYesterday = vehiclesYesterday.filter(
      v => v.status === 'offline'
    ).length

    const maintenanceToday = vehiclesToday.filter(
      v => v.status === 'maintenance'
    ).length
    const maintenanceYesterday = vehiclesYesterday.filter(
      v => v.status === 'maintenance'
    ).length

    return {
      totalToday,
      totalYesterday,
      onMissionToday,
      onMissionYesterday,
      onlineToday,
      onlineYesterday,
      offlineToday,
      offlineYesterday,
      maintenanceToday,
      maintenanceYesterday
    }
  }, [vehicles])

  return {
    vehicles,
    loading,
    selectedVehicleId,
    setSelectedVehicleId,
    stats
  }
}

export default useVehicleData
