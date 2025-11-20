import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

const useVehicleBattery = (selectedVehicle, refreshInterval = 30000) => {
  const [batteryData, setBatteryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBatteryData = async () => {
      if (!selectedVehicle) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          API_ENDPOINTS.BATTERY.BY_VEHICLE(selectedVehicle),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setBatteryData(data.slice(0, 2))
          } else {
            setBatteryData([])
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (err) {
        console.error('Error fetching battery data:', err)
        setError(err.message)
        setBatteryData([])
      } finally {
        setLoading(false)
      }
    }

    fetchBatteryData()

    // No auto-refresh - only fetch when vehicle changes
  }, [selectedVehicle])

  return { batteryData, loading, error }
}

export default useVehicleBattery
