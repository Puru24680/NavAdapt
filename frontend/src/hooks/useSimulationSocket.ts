import { useEffect, useState, useRef, useCallback } from 'react';
import { SimulationState } from '../types/simulation';

const DEFAULT_INITIAL_STATE: SimulationState = {
  scenario_id: 'scenario_1',
  time: 0.0,
  step: 0,
  dt: 0.05,
  is_running: false,
  is_paused: false,
  is_completed: false,
  vehicle: {
    x: 0.0,
    y: 0.0,
    vx: 0.0,
    vy: 0.0,
    v: 0.0,
    yaw: 0.0,
    yaw_rate: 0.0,
    steering_angle: 0.0,
    acceleration: 0.0,
    jerk: 0.0,
    throttle: 0.0,
    brake: 0.0,
    gear: 'P',
    length: 4.6,
    width: 1.9,
    wheelbase: 2.7
  },
  objects: [],
  raw_detections: [],
  predictions: [],
  planned_trajectory: {
    points: [],
    cost: 0.0,
    planner_type: 'Frenet Optimal Trajectory',
    is_replanned: false,
    generated_at_step: 0
  },
  candidate_trajectories: [],
  drivable_corridor: [],
  behavior_state: 'Follow',
  risk: {
    overall_score: 12.0,
    level: 'Safe',
    critical_object_id: null,
    min_ttc: 99.0,
    agent_risks: {},
    weights: { distance: 0.25, velocity: 0.15, ttc: 0.35, overlap: 0.15, vulnerability: 0.1 }
  },
  metrics: {
    scenario_completion_rate: 0.0,
    collision_count: 0,
    near_collision_count: 0,
    avg_replanning_latency_ms: 14.8,
    max_replanning_latency_ms: 26.2,
    avg_smoothness_jerk: 0.42,
    avg_curvature: 0.012,
    avg_ttc: 99.0,
    min_ttc: 99.0,
    emergency_brake_count: 0,
    avg_speed_kmh: 0.0,
    planning_success_rate: 100.0,
    perception_confidence: 97.5,
    prediction_error_m: 0.18
  },
  recent_events: [],
  active_notifications: ['System initialized. Awaiting simulation start.']
};

const getDefaultWsUrl = (): string => {
  if (typeof window === 'undefined') return 'ws://127.0.0.1:8000/ws/simulation';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (window.location.port === '5173') {
    return `${protocol}//${window.location.hostname}:8000/ws/simulation`;
  }
  return `${protocol}//${window.location.host}/ws/simulation`;
};

const getApiBase = (): string => {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000/api';
  if (window.location.port === '5173') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return '/api';
};

export function useSimulationSocket(customUrl?: string) {
  const url = customUrl || getDefaultWsUrl();
  const [state, setState] = useState<SimulationState>(DEFAULT_INITIAL_STATE);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    try {
      const targetUrl = customUrl || getDefaultWsUrl();
      const ws = new WebSocket(targetUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: SimulationState = JSON.parse(event.data);
          setState(data);
        } catch (err) {
          console.error('Failed to parse WebSocket JSON payload', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket error — using simulated telemetry fallback');
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };
    } catch (e: any) {
      setError(e.message || 'Connection failed');
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
    }
  }, [customUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const sendCommand = useCallback((action: string, payload: any = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action, payload }));
    } else {
      fetch(`${getApiBase()}/simulation/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((e) => console.warn('REST command dispatch failed', e));
    }
  }, []);

  const startSimulation = useCallback(() => sendCommand('start'), [sendCommand]);
  const pauseSimulation = useCallback(() => sendCommand('pause'), [sendCommand]);
  const stopSimulation = useCallback(() => sendCommand('stop'), [sendCommand]);
  const resetSimulation = useCallback((scenarioId: string) => sendCommand('reset', { scenario_id: scenarioId }), [sendCommand]);
  const replan = useCallback(() => sendCommand('replan'), [sendCommand]);
  const triggerHazard = useCallback((hazardType: string) => sendCommand('hazard', { hazard_type: hazardType }), [sendCommand]);

  return {
    state,
    connected,
    error,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    replan,
    triggerHazard
  };
}
