import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Auto-detect WebSocket URL from API URL
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // Convert https:// to wss:// and http:// to ws://
  const apiUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  return apiUrl;
};
const WS_URL = getWsUrl();

export const useLogData = () => {
  const [stats, setStats] = useState({
    vehicle_logs: { today: 0, yesterday: 0, total: 0, percentage_change: 0 },
    sensor_logs: { today: 0, yesterday: 0, total: 0, percentage_change: 0 },
    raw_logs: { today: 0, yesterday: 0, total: 0, percentage_change: 0 },
  });
  
  const [chartData, setChartData] = useState([]);
  
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [sensorLogs, setSensorLogs] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/logs/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch log stats:', err);
      setError(err.message);
    }
  }, []);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/logs/chart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChartData(response.data.chart_data || []);
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      setError(err.message);
    }
  }, []);

  // Fetch vehicle logs
  const fetchVehicleLogs = useCallback(async (limit = 200) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/vehicle-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || response.data || [];
      setVehicleLogs(data);
      console.log('✅ Fetched vehicle logs:', data.length);
    } catch (err) {
      console.error('Failed to fetch vehicle logs:', err);
    }
  }, []);

  // Fetch sensor logs
  const fetchSensorLogs = useCallback(async (limit = 200) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/sensor-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || response.data || [];
      setSensorLogs(data);
      console.log('✅ Fetched sensor logs:', data.length);
    } catch (err) {
      console.error('Failed to fetch sensor logs:', err);
    }
  }, []);

  // Fetch raw logs
  const fetchRawLogs = useCallback(async (limit = 200) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/raw-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('📦 Raw logs API response:', response.data);
      console.log('📦 Type of response.data:', typeof response.data);
      console.log('📦 Is array?:', Array.isArray(response.data));
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && response.data.data) {
        data = response.data.data;
      } else {
        console.warn('⚠️ Unexpected raw logs response format:', response.data);
      }
      
      setRawLogs(data);
      console.log('✅ Set rawLogs state with', data.length, 'items');
    } catch (err) {
      console.error('❌ Failed to fetch raw logs:', err);
      setRawLogs([]); // Set empty array on error
    }
  }, []);

  // Recalculate stats from current data
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const vehicleToday = vehicleLogs.filter(log => new Date(log.created_at).toDateString() === today).length;
    const vehicleYesterday = vehicleLogs.filter(log => new Date(log.created_at).toDateString() === yesterday).length;
    
    const sensorToday = sensorLogs.filter(log => new Date(log.created_at).toDateString() === today).length;
    const sensorYesterday = sensorLogs.filter(log => new Date(log.created_at).toDateString() === yesterday).length;
    
    const rawToday = rawLogs.filter(log => new Date(log.created_at).toDateString() === today).length;
    const rawYesterday = rawLogs.filter(log => new Date(log.created_at).toDateString() === yesterday).length;
    
    setStats({
      vehicle_logs: {
        today: vehicleToday,
        yesterday: vehicleYesterday,
        total: vehicleLogs.length,
        percentage_change: vehicleYesterday > 0 ? ((vehicleToday - vehicleYesterday) / vehicleYesterday * 100) : 0,
      },
      sensor_logs: {
        today: sensorToday,
        yesterday: sensorYesterday,
        total: sensorLogs.length,
        percentage_change: sensorYesterday > 0 ? ((sensorToday - sensorYesterday) / sensorYesterday * 100) : 0,
      },
      raw_logs: {
        today: rawToday,
        yesterday: rawYesterday,
        total: rawLogs.length,
        percentage_change: rawYesterday > 0 ? ((rawToday - rawYesterday) / rawYesterday * 100) : 0,
      },
    });
  }, [vehicleLogs, sensorLogs, rawLogs]);

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchChartData(),
        fetchVehicleLogs(),
        fetchSensorLogs(),
        fetchRawLogs(),
      ]);
      setLoading(false);
    };
    
    fetchAllData();
  }, [fetchChartData, fetchVehicleLogs, fetchSensorLogs, fetchRawLogs]);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found, skipping WebSocket connection');
      return;
    }

    let websocket = null;
    let reconnectTimeout = null;
    let pingInterval = null;
    let isIntentionalClose = false;

    const connect = () => {
      const wsUrl = `${WS_URL}/ws/logs?token=${token}`;
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('✅ WebSocket connected successfully for logs');
        
        // Send ping every 30 seconds to keep connection alive
        pingInterval = setInterval(() => {
          if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      
      websocket.onmessage = (event) => {
        console.log('📨 WebSocket message received:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('📦 Parsed message:', message);
          
          // Ignore pong messages
          if (message.type === 'pong') return;
          
          if (message.type === 'vehicle_log') {
            console.log('🚗 Received vehicle log:', message.data);
            setVehicleLogs((prev) => [message.data, ...prev].slice(0, 200));
            setStats((prev) => ({
              ...prev,
              vehicle_logs: {
                ...prev.vehicle_logs,
                today: prev.vehicle_logs.today + 1,
                total: prev.vehicle_logs.total + 1,
              },
            }));
          } else if (message.type === 'sensor_log') {
            console.log('📡 Received sensor log:', message.data);
            setSensorLogs((prev) => [message.data, ...prev].slice(0, 200));
            setStats((prev) => ({
              ...prev,
              sensor_logs: {
                ...prev.sensor_logs,
                today: prev.sensor_logs.today + 1,
                total: prev.sensor_logs.total + 1,
              },
            }));
          } else if (message.type === 'raw_log') {
            console.log('📝 Received raw log:', message.data);
            setRawLogs((prev) => [message.data, ...prev].slice(0, 200));
            setStats((prev) => ({
              ...prev,
              raw_logs: {
                ...prev.raw_logs,
                today: prev.raw_logs.today + 1,
                total: prev.raw_logs.total + 1,
              },
            }));
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err, 'Raw data:', event.data);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      websocket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        
        // Clear ping interval
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        
        // Auto-reconnect after 3 seconds if not intentional close
        if (!isIntentionalClose) {
          console.log('🔄 Reconnecting in 3 seconds...');
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
      
      setWs(websocket);
    };

    connect();
    
    return () => {
      isIntentionalClose = true;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (websocket?.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection');
        websocket.close();
      }
    };
  }, []);

  return {
    stats,
    chartData,
    vehicleLogs,
    sensorLogs,
    rawLogs,
    loading,
    error,
    refetch: () => {
      fetchStats();
      fetchChartData();
      fetchVehicleLogs();
      fetchSensorLogs();
      fetchRawLogs();
    },
  };
};

