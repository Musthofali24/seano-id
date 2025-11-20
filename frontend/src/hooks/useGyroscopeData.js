import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config'

const useGyroscopeData = selectedVehicle => {
  const [gyroscopeData, setGyroscopeData] = useState({
    pitch: 0, // Rotation around X-axis (-90 to 90 degrees)
    roll: 0, // Rotation around Z-axis (-180 to 180 degrees)
    yaw: 0, // Rotation around Y-axis (0 to 360 degrees)
    timestamp: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const hasErrorRef = useRef(false) // Track if endpoint returns 404 to avoid repeated attempts

  useEffect(() => {
    let interval
    let loadingTimeout

    // Set maximum loading time of 5 seconds
    loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    const fetchGyroscopeData = async () => {
      if (!selectedVehicle || hasErrorRef.current) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/gyroscope/${selectedVehicle}`
        )

        if (!response.ok) {
          // Mark as error to avoid repeated failed attempts
          if (response.status === 404) {
            hasErrorRef.current = true
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        setGyroscopeData({
          pitch: data.pitch || 0,
          roll: data.roll || 0,
          yaw: data.yaw || 0,
          timestamp: data.timestamp || new Date().toISOString()
        })

        setIsLoading(false)
        // Clear loading timeout since we got a response
        if (loadingTimeout) clearTimeout(loadingTimeout)
      } catch (error) {
        // Use default/fallback data on error
        setGyroscopeData(prev => ({
          ...prev,
          timestamp: new Date().toISOString()
        }))
        setIsLoading(false)
        if (loadingTimeout) clearTimeout(loadingTimeout)
      }
    }

    if (selectedVehicle) {
      hasErrorRef.current = false // Reset error flag when vehicle changes
      fetchGyroscopeData()
      interval = setInterval(fetchGyroscopeData, 10000) // Update every 10 seconds (reduced from 1s)
    } else {
      // Reset to neutral when no vehicle selected
      setGyroscopeData({
        pitch: 0,
        roll: 0,
        yaw: 0,
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      if (loadingTimeout) clearTimeout(loadingTimeout)
    }
  }, [selectedVehicle])

  // Function to manually reset gyroscope orientation
  const resetOrientation = () => {
    setGyroscopeData(prev => ({
      ...prev,
      pitch: 0,
      roll: 0,
      yaw: 0,
      timestamp: new Date().toISOString()
    }))
  }

  // Function to get stability status based on gyroscope values
  const getStabilityStatus = () => {
    const { pitch, roll } = gyroscopeData
    const totalTilt = Math.sqrt(pitch * pitch + roll * roll)

    if (totalTilt < 5)
      return { status: 'stable', color: 'green', message: 'Stable' }
    if (totalTilt < 15)
      return { status: 'moderate', color: 'yellow', message: 'Moderate Motion' }
    if (totalTilt < 25)
      return { status: 'rough', color: 'orange', message: 'Rough Conditions' }
    return { status: 'extreme', color: 'red', message: 'Extreme Motion' }
  }

  return {
    gyroscopeData,
    isLoading,
    resetOrientation,
    stabilityStatus: getStabilityStatus()
  }
}

export default useGyroscopeData
