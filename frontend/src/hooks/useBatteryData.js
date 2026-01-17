import { useState, useEffect, useCallback } from 'react'
import { WS_URL } from '../config'

/**
 * useBatteryData - Hook untuk battery monitoring real-time
 *
 * SUMBER DATA:
 * - WebSocket untuk real-time battery updates dari MQTT
 *
 * MESSAGE FORMAT:
 * {
 *   "type": "battery",
 *   "vehicle_id": 1,
 *   "vehicle_code": "USV001",
 *   "battery_id": 1,
 *   "percentage": 85.5,
 *   "voltage": 12.4,
 *   "current": 2.3,
 *   "temperature": 25.5,
 *   "status": "discharging",
 *   "timestamp": "2026-01-17T10:30:00Z"
 * }
 */
const useBatteryData = () => {
  const [batteryData, setBatteryData] = useState({})
  const [ws, setWs] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(event => {
    try {
      const message = JSON.parse(event.data)
      console.log('Parsed message:', message)

      // Only handle battery type messages
      if (message.type === 'battery') {
        const {
          vehicle_id,
          battery_id,
          percentage,
          voltage,
          current,
          temperature,
          status,
          timestamp
        } = message

        console.log('Battery data:', {
          vehicle_id,
          battery_id,
          percentage,
          voltage,
          current,
          temperature,
          status
        })

        setBatteryData(prev => {
          const vehicleBatteries = prev[vehicle_id] || { 1: null, 2: null }

          const newData = {
            ...prev,
            [vehicle_id]: {
              ...vehicleBatteries,
              [battery_id]: {
                battery_id,
                percentage,
                voltage,
                current,
                temperature,
                status,
                timestamp: timestamp || new Date().toISOString()
              }
            }
          }

          console.log('Updated batteryData state:', newData)
          return newData
        })

        setLastUpdate(new Date().toISOString())
        console.log(
          `✓ Battery data updated: vehicle=${vehicle_id} battery=${battery_id} percentage=${percentage}%`
        )
      }
    } catch (error) {
      console.error('Error parsing battery WebSocket message:', error)
    }
  }, [])

  // Setup WebSocket connection
  useEffect(() => {
    const wsUrl = WS_URL.replace('/api', '')
    const socket = new WebSocket(`${wsUrl}/ws/logs`)

    socket.onopen = () => {
      console.log('✓ Battery WebSocket connected')
      setIsConnected(true)
    }

    socket.onmessage = handleMessage

    socket.onerror = error => {
      console.error('Battery WebSocket error:', error)
      setIsConnected(false)
    }

    socket.onclose = () => {
      console.log('✗ Battery WebSocket disconnected')
      setIsConnected(false)
    }

    setWs(socket)

    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [handleMessage])

  // Get battery data for specific vehicle
  const getVehicleBatteries = useCallback(
    vehicleId => {
      console.log('🔍 getVehicleBatteries called with vehicleId:', vehicleId)
      console.log('🔍 Current batteryData state:', batteryData)
      console.log('🔍 batteryData keys:', Object.keys(batteryData))

      if (!vehicleId) {
        console.log('⚠️ No vehicleId provided, returning empty batteries')
        return { 1: null, 2: null }
      }

      const result = batteryData[vehicleId] || { 1: null, 2: null }
      console.log(`🔍 Returning batteries for vehicle ${vehicleId}:`, result)
      return result
    },
    [batteryData]
  )

  // Get summary stats
  const getSummary = useCallback(
    vehicleId => {
      const batteries = getVehicleBatteries(vehicleId)
      const battery1 = batteries[1]
      const battery2 = batteries[2]

      const validBatteries = [battery1, battery2].filter(b => b !== null)

      if (validBatteries.length === 0) {
        return {
          totalCapacity: 0,
          averagePercentage: 0,
          totalVoltage: 0,
          totalCurrent: 0,
          avgTemperature: 0,
          batteryCount: 0
        }
      }

      const totalPercentage = validBatteries.reduce(
        (sum, b) => sum + (b.percentage || 0),
        0
      )
      const totalVoltage = validBatteries.reduce(
        (sum, b) => sum + (b.voltage || 0),
        0
      )
      const totalCurrent = validBatteries.reduce(
        (sum, b) => sum + (b.current || 0),
        0
      )
      const totalTemp = validBatteries.reduce(
        (sum, b) => sum + (b.temperature || 0),
        0
      )

      return {
        totalCapacity: 0, // This would come from battery specs if available
        averagePercentage: totalPercentage / validBatteries.length,
        totalVoltage,
        totalCurrent,
        avgTemperature: totalTemp / validBatteries.length,
        batteryCount: validBatteries.length
      }
    },
    [getVehicleBatteries]
  )

  return {
    batteryData,
    ws,
    isConnected,
    lastUpdate,
    getVehicleBatteries,
    getSummary
  }
}

export default useBatteryData
