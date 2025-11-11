import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

const useVehicleRawLogs = (
  selectedVehicle,
  limit = 50,
  refreshInterval = 30000
) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRawLogs = async () => {
      if (!selectedVehicle) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          API_ENDPOINTS.VEHICLES.RAW_LOGS(selectedVehicle)
        )

        if (!response.ok) {
          throw new Error('Failed to fetch raw logs')
        }

        const data = await response.json()
        setLogs(data.slice(0, limit))
      } catch (err) {
        console.error('Error fetching raw logs:', err)
        setError(err.message)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchRawLogs()

    // Refresh data at specified interval
    const interval = setInterval(fetchRawLogs, refreshInterval)

    return () => clearInterval(interval)
  }, [selectedVehicle, limit, refreshInterval])

  return { logs, loading, error }
}

export default useVehicleRawLogs
