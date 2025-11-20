import { useEffect, useRef, useCallback, useState } from 'react'
import { API_BASE_URL } from '../config'

/**
 * useMQTT Hook - Real-time WebSocket Connection to Backend
 *
 * FUNGSI:
 * - Connect ke backend WebSocket (bukan MQTT langsung)
 * - Backend yang subscribe ke MQTT dan broadcast ke frontend via WebSocket
 * - Store messages dalam memory cache berdasarkan topic
 * - Provide methods untuk subscribe/getMessage
 *
 * ALUR DATA:
 * 1. Raspberry Pi → MQTT Broker (seano/{registration_code}/vehicle_log)
 * 2. Backend subscribe MQTT → Store to DB → Broadcast via WebSocket
 * 3. Frontend connect WebSocket → Receive real-time updates
 * 4. Component read message via getMessage(topic)
 * 5. Update UI real-time
 *
 * CONNECTION:
 * - URL: ws://api.seano.cloud/ws (WebSocket to Backend)
 * - Auto reconnect jika disconnect
 *
 * @returns {Object} { isConnected, subscribe, getMessage, getAllMessages }
 */
const useMQTT = () => {
  const wsRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState({})
  const subscribedTopicsRef = useRef(new Set())
  const reconnectTimeoutRef = useRef(null)

  // Initialize WebSocket connection to backend
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Convert http://api.seano.cloud to ws://api.seano.cloud
        const wsUrl =
          API_BASE_URL.replace('http://', 'ws://').replace(
            'https://',
            'wss://'
          ) + '/ws'
        console.log('🔌 Connecting to Backend WebSocket:', wsUrl)

        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('✅ WebSocket Connected to Backend')
          setIsConnected(true)

          // Clear reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        ws.onclose = () => {
          console.log('❌ WebSocket Disconnected')
          setIsConnected(false)

          // Auto reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Reconnecting WebSocket...')
            connectWebSocket()
          }, 5000)
        }

        ws.onerror = error => {
          console.error('🔴 WebSocket Error:', error)
        }

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data)

            // Backend sends: {type, registration_code, topic, data, timestamp}
            if (message.topic && message.data) {
              setMessages(prev => ({
                ...prev,
                [message.topic]: {
                  payload: JSON.stringify(message.data),
                  timestamp: message.timestamp,
                  data: message.data
                }
              }))
              console.log(`📨 Message on ${message.topic}:`, message.data)
            }
          } catch (err) {
            console.error('Error processing WebSocket message:', err)
          }
        }

        wsRef.current = ws
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // Subscribe to a topic (just tracking, backend handles actual MQTT subscription)
  const subscribe = useCallback(topic => {
    if (!subscribedTopicsRef.current.has(topic)) {
      subscribedTopicsRef.current.add(topic)
      console.log(`✅ Subscribed to ${topic}`)
    }
  }, [])

  // Unsubscribe from a topic
  const unsubscribe = useCallback(topic => {
    if (subscribedTopicsRef.current.has(topic)) {
      subscribedTopicsRef.current.delete(topic)
      console.log(`❌ Unsubscribed from ${topic}`)
    }
  }, [])

  // Subscribe to all logs for a vehicle
  const subscribeToVehicleLogs = useCallback(
    vehicleCode => {
      subscribe(`seano/${vehicleCode}/raw_log`)
      subscribe(`seano/${vehicleCode}/sensor_log`)
      subscribe(`seano/${vehicleCode}/vehicle_log`)
    },
    [subscribe]
  )

  // Unsubscribe from all logs for a vehicle
  const unsubscribeFromVehicleLogs = useCallback(
    vehicleCode => {
      unsubscribe(`seano/${vehicleCode}/raw_log`)
      unsubscribe(`seano/${vehicleCode}/sensor_log`)
      unsubscribe(`seano/${vehicleCode}/vehicle_log`)
    },
    [unsubscribe]
  )

  // Get latest message for a specific topic
  const getMessage = useCallback(
    topic => {
      return messages[topic] || null
    },
    [messages]
  )

  // Get all messages
  const getAllMessages = useCallback(() => {
    return messages
  }, [messages])

  return {
    isConnected,
    subscribe,
    unsubscribe,
    subscribeToVehicleLogs,
    unsubscribeFromVehicleLogs,
    getMessage,
    getAllMessages,
    messages
  }
}

export default useMQTT
