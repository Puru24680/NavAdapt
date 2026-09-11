import React, { useRef, useEffect, useState } from 'react';
import { SimulationState, TrackedObject, ObjectClass } from '../../types/simulation';
import { ZoomIn, ZoomOut, Maximize2, Crosshair, Layers } from 'lucide-react';

interface BevCanvasProps {
  state: SimulationState;
  showCandidates?: boolean;
  showPredictions?: boolean;
  showSensorFOV?: boolean;
}

export const BevCanvas: React.FC<BevCanvasProps> = ({
  state,
  showCandidates = true,
  showPredictions = true,
  showSensorFOV = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(10.0); // pixels per meter
  const [followEgo, setFollowEgo] = useState<boolean>(true);

  const { vehicle: ego, objects, planned_trajectory, previous_trajectory, candidate_trajectories, risk } = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#080E1A';
    ctx.fillRect(0, 0, width, height);

    // World to Screen coordinate transform:
    // Screen Center aligns with Ego lookahead (Ego is placed at 25% from bottom)
    const egoScreenX = width * 0.35;
    const egoScreenY = height * 0.5;

    const toScreen = (worldX: number, worldY: number) => {
      // Rotate world so Ego heading points UP or world X is horizontal
      const dx = worldX - ego.x;
      const dy = worldY - ego.y;
      // In this display, let's keep world X moving right-to-left or forward
      // Ego traveling along +X: screen X = egoScreenX + dx * zoom, screen Y = egoScreenY - dy * zoom
      return {
        x: egoScreenX + dx * zoom,
        y: egoScreenY - dy * zoom
      };
    };

    // 1. Draw Ground Grid & Scale
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSpacing = 10 * zoom; // 10 meter grid
    const startX = (egoScreenX - ego.x * zoom) % gridSpacing;
    const startY = (egoScreenY + ego.y * zoom) % gridSpacing;

    for (let x = startX - gridSpacing; x < width + gridSpacing; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = startY - gridSpacing; y < height + gridSpacing; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Road Boundaries & Drivable Corridor
    const bounds = state.scenario_id ? state.drivable_corridor : [];
    // Draw road surface fill
    if (bounds.length > 2) {
      ctx.beginPath();
      const first = toScreen(bounds[0][0], bounds[0][1]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < bounds.length; i++) {
        const pt = toScreen(bounds[i][0], bounds[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fill();
    }

    // Draw Left and Right boundary lines
    // Left shoulder / curb
    ctx.strokeStyle = '#38BDF8'; // Sky blue border
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let x = Math.max(0, ego.x - 40); x < ego.x + 120; x += 3) {
      const y_left = 3.2; // default
      const p = toScreen(x, y_left);
      if (x === Math.max(0, ego.x - 40)) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Right shoulder
    ctx.strokeStyle = '#38BDF8';
    ctx.beginPath();
    for (let x = Math.max(0, ego.x - 40); x < ego.x + 120; x += 3) {
      const y_right = -3.2;
      const p = toScreen(x, y_right);
      if (x === Math.max(0, ego.x - 40)) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Dirt verge hatching (unpaved side of road)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
    ctx.lineWidth = 1;
    for (let x = Math.max(0, ego.x - 40); x < ego.x + 100; x += 6) {
      const p1 = toScreen(x, 3.2);
      const p2 = toScreen(x + 3, 5.5);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = toScreen(x, -3.2);
      const p4 = toScreen(x + 3, -5.5);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // 3. Draw Potholes
    if (state.scenario_id) {
      // Render sample potholes
      const samplePotholes = [
        { x: 52.0, y: 0.4, r: 0.7 },
        { x: 110.0, y: -0.5, r: 0.6 }
      ];
      samplePotholes.forEach((pot) => {
        const sc = toScreen(pot.x, pot.y);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, pot.r * zoom, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FCA5A5';
        ctx.font = '10px monospace';
        ctx.fillText('POTHOLE', sc.x - 24, sc.y - (pot.r * zoom + 5));
      });
    }

    // 4. Sensor FOV Cones
    if (showSensorFOV) {
      const egoCenter = toScreen(ego.x, ego.y);
      // LiDAR 360 ring
      ctx.beginPath();
      ctx.arc(egoCenter.x, egoCenter.y, 45 * zoom, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Camera Front FOV cone (110 deg)
      ctx.beginPath();
      ctx.moveTo(egoCenter.x, egoCenter.y);
      const camRange = 40 * zoom;
      const fovRad = (110 * Math.PI) / 180;
      const leftAngle = -ego.yaw - fovRad / 2;
      const rightAngle = -ego.yaw + fovRad / 2;
      ctx.arc(egoCenter.x, egoCenter.y, camRange, leftAngle, rightAngle, false);
      ctx.closePath();
      ctx.fillStyle = 'rgba(37, 99, 235, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.setLineDash([2, 4]);
      ctx.stroke();

      // Radar Forward Narrow Beam (45 deg, 70m)
      ctx.beginPath();
      ctx.moveTo(egoCenter.x, egoCenter.y);
      const radarRange = 65 * zoom;
      const radarFov = (45 * Math.PI) / 180;
      ctx.arc(egoCenter.x, egoCenter.y, radarRange, -ego.yaw - radarFov/2, -ego.yaw + radarFov/2, false);
      ctx.closePath();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Candidate Trajectories (Lattice)
    if (showCandidates && candidate_trajectories && candidate_trajectories.length > 0) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      candidate_trajectories.forEach((line) => {
        if (line.length > 1) {
          ctx.beginPath();
          const p0 = toScreen(line[0][0], line[0][1]);
          ctx.moveTo(p0.x, p0.y);
          for (let i = 1; i < line.length; i++) {
            const p = toScreen(line[i][0], line[i][1]);
            ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);
    }

    // 6. Previous Planned Path (Dashed Reference)
    if (previous_trajectory && previous_trajectory.points && previous_trajectory.points.length > 1) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const p0 = toScreen(previous_trajectory.points[0].x, previous_trajectory.points[0].y);
      ctx.moveTo(p0.x, p0.y);
      previous_trajectory.points.forEach((pt) => {
        const p = toScreen(pt.x, pt.y);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Optimal Planned Trajectory (Electric Cyan Glow)
    if (planned_trajectory && planned_trajectory.points && planned_trajectory.points.length > 1) {
      // Glow layer
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const p0 = toScreen(planned_trajectory.points[0].x, planned_trajectory.points[0].y);
      ctx.moveTo(p0.x, p0.y);
      planned_trajectory.points.forEach((pt) => {
        const p = toScreen(pt.x, pt.y);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      // Waypoint dots
      ctx.fillStyle = '#FFFFFF';
      planned_trajectory.points.forEach((pt, idx) => {
        if (idx % 3 === 0) {
          const p = toScreen(pt.x, pt.y);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }

    // 8. Dynamic Obstacles & Surrounding Agents
    objects.forEach((obj) => {
      const pos = toScreen(obj.x, obj.y);

      // Past history track trail
      if (obj.history && obj.history.length > 1) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const h0 = toScreen(obj.history[0][0], obj.history[0][1]);
        ctx.moveTo(h0.x, h0.y);
        obj.history.forEach((h) => {
          const hp = toScreen(h[0], h[1]);
          ctx.lineTo(hp.x, hp.y);
        });
        ctx.stroke();
      }

      // Multi-Hypothesis Predicted Trajectories
      if (showPredictions && state.predictions) {
        const pred = state.predictions.find((p) => p.object_id === obj.id);
        if (pred && pred.hypotheses) {
          pred.hypotheses.forEach((hyp) => {
            ctx.strokeStyle = hyp.probability > 0.5 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(245, 158, 11, 0.3)';
            ctx.lineWidth = hyp.probability > 0.5 ? 2.0 : 1.2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            if (hyp.points.length > 0) {
              const pt0 = toScreen(hyp.points[0].x, hyp.points[0].y);
              ctx.moveTo(pt0.x, pt0.y);
              hyp.points.forEach((p) => {
                const sp = toScreen(p.x, p.y);
                ctx.lineTo(sp.x, sp.y);
              });
              ctx.stroke();
            }
          });
          ctx.setLineDash([]);
        }
      }

      // Draw Object Box / Icon by Class
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(-obj.yaw);

      const objW = (obj.width || 1.5) * zoom;
      const objL = (obj.length || 2.0) * zoom;

      // Color coding based on Indian road user class
      let fillColor = '#94A3B8';
      let strokeColor = '#CBD5E1';

      if (obj.class_name === 'animal') {
        fillColor = '#D97706'; // Saffron/amber for cow/cattle
        strokeColor = '#FBBF24';
      } else if (obj.class_name === 'pedestrian') {
        fillColor = '#06B6D4'; // Cyan
        strokeColor = '#67E8F9';
      } else if (obj.class_name === 'auto_rickshaw') {
        fillColor = '#EAB308'; // Classic yellow-green rickshaw
        strokeColor = '#FDE047';
      } else if (obj.class_name === 'motorcycle') {
        fillColor = '#EC4899'; // Pink/magenta
        strokeColor = '#F472B6';
      } else if (obj.class_name === 'pushcart') {
        fillColor = '#84CC16'; // Lime green
        strokeColor = '#A3E635';
      } else if (obj.class_name === 'truck' || obj.class_name === 'bus') {
        fillColor = '#6366F1'; // Indigo
        strokeColor = '#818CF8';
      } else {
        fillColor = '#3B82F6'; // Blue for car
        strokeColor = '#60A5FA';
      }

      // Draw rectangle footprint
      ctx.fillStyle = fillColor;
      ctx.fillRect(-objL / 2, -objW / 2, objL, objW);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-objL / 2, -objW / 2, objL, objW);

      // Heading arrow indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(objL / 2, 0);
      ctx.lineTo(objL / 2 - 4, -3);
      ctx.lineTo(objL / 2 - 4, 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Label badge
      ctx.fillStyle = 'rgba(11, 18, 32, 0.85)';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      const labelText = `${obj.class_name.toUpperCase()} (${(obj.confidence * 100).toFixed(0)}%)`;
      ctx.font = '9px monospace';
      const tw = ctx.measureText(labelText).width;
      ctx.fillRect(pos.x - tw / 2 - 3, pos.y - objW / 2 - 16, tw + 6, 12);
      ctx.strokeRect(pos.x - tw / 2 - 3, pos.y - objW / 2 - 16, tw + 6, 12);
      ctx.fillStyle = strokeColor;
      ctx.fillText(labelText, pos.x - tw / 2, pos.y - objW / 2 - 7);
    });

    // 9. Ego Vehicle Drawing
    const egoPos = toScreen(ego.x, ego.y);
    ctx.save();
    ctx.translate(egoPos.x, egoPos.y);
    ctx.rotate(-ego.yaw);

    const egoL = ego.length * zoom;
    const egoW = ego.width * zoom;

    // Safety Bubble (Margin buffer around ego)
    const isCritical = risk.level === 'Critical';
    ctx.beginPath();
    ctx.ellipse(0, 0, (ego.length / 2 + 1.2) * zoom, (ego.width / 2 + 1.0) * zoom, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(37, 99, 235, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ego Body (White/Blue high-tech chassis)
    ctx.fillStyle = '#1D4ED8'; // Electric blue
    ctx.fillRect(-egoL / 2, -egoW / 2, egoL, egoW);
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.strokeRect(-egoL / 2, -egoW / 2, egoL, egoW);

    // Windshield & Roof
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-egoL * 0.15, -egoW * 0.35, egoL * 0.45, egoW * 0.7);

    // Front headlights
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(egoL / 2 - 2, -egoW * 0.4, 3, egoW * 0.2);
    ctx.fillRect(egoL / 2 - 2, egoW * 0.2, 3, egoW * 0.2);

    // Steered front wheels
    const wheelL = 0.6 * zoom;
    const wheelW = 0.25 * zoom;
    const drawWheel = (wx: number, wy: number, steer: number) => {
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(-steer);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-wheelL / 2, -wheelW / 2, wheelL, wheelW);
      ctx.restore();
    };
    drawWheel(egoL * 0.3, -egoW / 2, ego.steering_angle);
    drawWheel(egoL * 0.3, egoW / 2, ego.steering_angle);
    drawWheel(-egoL * 0.3, -egoW / 2, 0.0);
    drawWheel(-egoL * 0.3, egoW / 2, 0.0);

    ctx.restore();

    // 10. HUD Overlay on canvas
    ctx.fillStyle = 'rgba(11, 18, 32, 0.8)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, 16, 210, 75);
    ctx.strokeRect(16, 16, 210, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px monospace';
    ctx.fillText(`X: ${ego.x.toFixed(2)}m | Y: ${ego.y.toFixed(2)}m`, 26, 34);
    ctx.fillText(`SPEED: ${(ego.v * 3.6).toFixed(1)} km/h (${ego.v.toFixed(2)} m/s)`, 26, 48);
    ctx.fillText(`STEER: ${(ego.steering_angle * 180 / Math.PI).toFixed(1)}° | YAW: ${(ego.yaw * 180 / Math.PI).toFixed(1)}°`, 26, 62);
    ctx.fillText(`PLANNER: ${state.planned_trajectory.planner_type || 'Frenet'}`, 26, 76);

  }, [state, zoom, followEgo, showCandidates, showPredictions, showSensorFOV]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-[#080E1A] shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Canvas Floating Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-navy-900/90 border border-slate-700/80 rounded-lg p-1.5 backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.min(25, z + 2))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(4, z - 2))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(10.0)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Reset Zoom"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
        <span className="text-[11px] font-mono text-cyan-400 px-1 font-bold">
          {zoom.toFixed(0)} px/m
        </span>
      </div>

      {/* Legend pill */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-3 bg-navy-950/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono backdrop-blur-sm">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-1 bg-cyan-400 rounded-sm" />
          <span className="text-slate-300">Planned Path</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
          <span className="text-slate-300">Cattle/Animals</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-xs" />
          <span className="text-slate-300">Auto-Rickshaw</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          <span className="text-slate-300">Pedestrian</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <span className="text-slate-300">Pothole Hazard</span>
        </div>
      </div>
    </div>
  );
};
