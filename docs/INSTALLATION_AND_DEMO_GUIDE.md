# Installation & Smart India Hackathon Demo Guide

## 1. Prerequisites
- **Python**: 3.10+ (Python 3.11 recommended; managed via `uv`).
- **Node.js**: v18+ or v20+ / v24+ (managed via npm).
- **OS**: Windows, macOS, or Linux.
- **Optional**: MATLAB R2022b+ with Automated Driving Toolbox and RoadRunner.

---

## 2. Fast Setup via Command Line

### A. Clone / Navigate to Monorepo
```bash
cd C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving
```

### B. Backend Setup (Python / FastAPI)
Using `uv` (fastest) or standard `pip`:
```powershell
# Using uv:
$env:Path = "C:\Users\wlc\.local\bin;$env:Path"
cd backend
uv venv .venv --python 3.11
uv pip install -r requirements.txt --prefix .venv

# Launch the Backend Server:
$env:PYTHONPATH = "C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving\backend"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### C. Frontend Setup (React / Vite)
In a separate terminal:
```powershell
cd C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving\frontend
npm install
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 3. SIH Interactive Presentation Walkthrough (Step-by-Step)

Follow this 5-minute flow during jury evaluation to demonstrate full system capability:

1. **Step 1: Open the Platform Overview**
   - Show the Landing Page headline: *"Adaptive Autonomous Navigation for India’s Unstructured Roads"*.
   - Point out the core paradigm shift: zero dependency on painted lane lines.

2. **Step 2: Launch the Command Dashboard**
   - Click **"Launch Command Dashboard"** in the navigation bar.
   - Point out the 3 perception feeds:
     - Front Camera AI Feed with bounding boxes and distances.
     - 360-degree LiDAR radial display.
     - 77 GHz Radar Doppler velocity plot.

3. **Step 3: Run Scenario 1 (Unmarked Village Road)**
   - Click **START** on the top navigation bar.
   - Observe ego vehicle moving along the rural road without lane paint.
   - Watch the local planner avoid surface potholes and roadside cattle by shifting lateral offset.

4. **Step 4: Execute Scenario 5 (Sudden Cattle Incursion)**
   - Go to **Scenario Library** and select **Scenario 5: Sudden Cattle Crossing**.
   - Click **START**. The vehicle cruises smoothly at $40\,\text{km/h}$.
   - Click **"Stray Cattle"** under the Hazard Injection bar.
   - **Observe**:
     - Cattle suddenly steps out at $22\,\text{m}$.
     - Composite Risk Score immediately spikes from $18$ (Safe) to $89$ (Critical).
     - Behavior planner executes `Emergency Brake`.
     - Stanley controller holds vehicle heading while $-6.0\,\text{m/s}^2$ braking decelerates vehicle to a complete stop at $2.5\,\text{m}$ clearance buffer.
     - Notification toast announces: *"ALERT: Critical Risk detected! Emergency response active."*
     - Once cattle clears, system automatically replans and resumes navigation.

5. **Step 5: Review Benchmark Scorecard**
   - Navigate to **Benchmark Analytics**.
   - Show the real-time Recharts graphs:
     - Curvature profile and Jerk minimization.
     - Sub-15ms Replanning Latency histogram.
     - 0 collisions and 100% planning feasibility.

6. **Step 6: Show MathWorks / RoadRunner Integration**
   - Open **14-Stage Architecture** and **Algorithms & Math** to display the exact mathematical derivations matching MATLAB parameter scripts in `matlab_simulink/`.
