import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

const useVehicleSensorLogs = (
  selectedVehicle,
  limit = 50,
  refreshInterval = 30000
) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSensorLogs = async () => {
      if (!selectedVehicle) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          API_ENDPOINTS.VEHICLES.SENSOR_LOGS(selectedVehicle)
        )

        if (!response.ok) {
          throw new Error('Failed to fetch sensor logs')
        }

        const data = await response.json()
        setLogs(data.slice(0, limit))
      } catch (err) {
        console.error('Error fetching sensor logs:', err)
        setError(err.message)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchSensorLogs()

    // Refresh data at specified interval
    const interval = setInterval(fetchSensorLogs, refreshInterval)

    return () => clearInterval(interval)
  }, [selectedVehicle, limit, refreshInterval])

  return { logs, loading, error }
}

export default useVehicleSensorLogs
