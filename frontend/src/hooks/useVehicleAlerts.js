import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

const useVehicleAlerts = (
  selectedVehicle,
  limit = 10,
  refreshInterval = 30000
) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!selectedVehicle) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_ENDPOINTS.VEHICLES.ALERTS(selectedVehicle)}?limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch alerts')
        }

        const data = await response.json()

        // Ensure data is an array before slicing
        const alertsArray = Array.isArray(data) ? data : data.data || []
        setAlerts(alertsArray.slice(0, limit))
      } catch (err) {
        console.error('Error fetching alerts:', err)
        setError(err.message)
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    // Refresh data at specified interval
    const interval = setInterval(fetchAlerts, refreshInterval)

    return () => clearInterval(interval)
  }, [selectedVehicle, limit, refreshInterval])

  return { alerts, loading, error }
}

export default useVehicleAlerts
