import { useState, useEffect } from 'react'

const useSensorTypesData = () => {
  const [sensorTypes, setSensorTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSensorTypes: 0,
    activeSensorTypes: 0,
    inactiveSensorTypes: 0,
    hidrografiTypes: 0,
    oseanografiTypes: 0
  })

  useEffect(() => {
    // Fetch sensor types from API
    const fetchSensorTypes = async () => {
      setLoading(true)

      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/sensor-types');
        // const data = await response.json();
        // setSensorTypes(data);

        // For now, set empty array (no dummy data)
        setSensorTypes([])

        // Calculate stats from real data
        calculateStats([])
      } catch (error) {
        console.error('Error fetching sensor types:', error)
        setSensorTypes([])
        calculateStats([])
      } finally {
        setLoading(false)
      }
    }

    fetchSensorTypes()
  }, [])

  const calculateStats = sensorTypeData => {
    const totalSensorTypes = sensorTypeData.length
    const activeSensorTypes = sensorTypeData.filter(st => st.is_active).length
    const inactiveSensorTypes = totalSensorTypes - activeSensorTypes
    const hidrografiTypes = sensorTypeData.filter(st =>
      (st.name || '').toLowerCase().includes('hidrografi')
    ).length
    const oseanografiTypes = sensorTypeData.filter(st =>
      (st.name || '').toLowerCase().includes('oseanografi')
    ).length

    setStats({
      totalSensorTypes,
      activeSensorTypes,
      inactiveSensorTypes,
      hidrografiTypes,
      oseanografiTypes
    })
  }

  const addSensorType = newSensorType => {
    const sensorType = {
      ...newSensorType,
      id: sensorTypes.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedSensorTypes = [...sensorTypes, sensorType]
    setSensorTypes(updatedSensorTypes)

    // Recalculate stats with new sensor type
    calculateStats(updatedSensorTypes)
  }

  return {
    sensorTypes,
    loading,
    stats,
    addSensorType
  }
}

export default useSensorTypesData
