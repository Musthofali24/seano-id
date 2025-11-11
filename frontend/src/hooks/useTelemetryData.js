import { useState, useEffect } from 'react'
import { getTelemetryCards } from '../constant'
import useLoadingTimeout from './useLoadingTimeout'

const useTelemetryData = (hasVehicleData = false) => {
  const [telemetryData, setTelemetryData] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { loading: isInitialLoading } = useLoadingTimeout(true, 5000)

  const shouldShowSkeleton = isInitialLoading || isRefreshing

  // Load initial telemetry data
  useEffect(() => {
    if (!shouldShowSkeleton) {
      setTelemetryData(getTelemetryCards(hasVehicleData))
    }
  }, [shouldShowSkeleton, hasVehicleData])

  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setTelemetryData(getTelemetryCards(hasVehicleData))
      setIsRefreshing(false)
    }, 1000)
  }

  return {
    telemetryData,
    isLoading: shouldShowSkeleton,
    isRefreshing,
    refreshData
  }
}

export default useTelemetryData
