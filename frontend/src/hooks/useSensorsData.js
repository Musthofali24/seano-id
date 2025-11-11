import { useState, useEffect } from 'react'

const useSensorsData = () => {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSensors: 0,
    activeSensors: 0,
    inactiveSensors: 0,
    hidrografiSensors: 0,
    oseanografiSensors: 0
  })

  useEffect(() => {
    // Fetch sensors from API
    const fetchSensors = async () => {
      setLoading(true)

      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/sensors');
        // const data = await response.json();
        // setSensors(data);

        // For now, set empty array (no dummy data)
        setSensors([])

        // Calculate stats from real data
        calculateStats([])
      } catch (error) {
        console.error('Error fetching sensors:', error)
        setSensors([])
        calculateStats([])
      } finally {
        setLoading(false)
      }
    }

    fetchSensors()
  }, [])

  const calculateStats = sensorData => {
    const totalSensors = sensorData.length
    const activeSensors = sensorData.filter(s => s.is_active).length
    const inactiveSensors = totalSensors - activeSensors
    const hidrografiSensors = sensorData.filter(
      s => s.sensor_type_id === 'hidrografi' || s.type === 'hidrografi'
    ).length
    const oseanografiSensors = sensorData.filter(
      s => s.sensor_type_id === 'oseanografi' || s.type === 'oseanografi'
    ).length

    setStats({
      totalSensors,
      activeSensors,
      inactiveSensors,
      hidrografiSensors,
      oseanografiSensors
    })
  }

  const addSensor = newSensor => {
    const sensor = {
      ...newSensor,
      id: sensors.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedSensors = [...sensors, sensor]
    setSensors(updatedSensors)

    // Recalculate stats with new sensor
    calculateStats(updatedSensors)
  }

  return {
    sensors,
    loading,
    stats,
    addSensor
  }
}

export default useSensorsData
