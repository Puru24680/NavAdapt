# Testing & Verification Guide

## 1. Automated Test Suite

The test suite covers algorithmic correctness for:
- Frenet coordinate transforms and cubic spline continuity.
- Quintic polynomial boundary value solvers.
- Dynamic composite risk evaluation across all 4 tiers (Safe, Caution, High Risk, Critical).
- Closed-loop simulation execution of all 5 Indian scenarios.
- Dynamic hazard trigger handling and replanning event generation.

### Running Backend Unit & System Tests
```powershell
$env:Path = "C:\Users\wlc\.local\bin;$env:Path"
$env:PYTHONPATH = "C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving\backend"
cd C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving\backend

uv run python -m pytest tests -v
```

Expected Output:
```
tests/test_planning.py::test_cubic_spline_frenet PASSED
tests/test_planning.py::test_quintic_polynomial PASSED
tests/test_planning.py::test_adaptive_local_planner PASSED
tests/test_risk.py::test_risk_safe PASSED
tests/test_risk.py::test_risk_critical PASSED
tests/test_scenarios.py::test_all_five_scenarios_load_and_step PASSED
tests/test_scenarios.py::test_sudden_cattle_hazard_trigger PASSED
==================== 7 passed in 1.41s ====================
```

---

## 2. Frontend Build Verification
```powershell
cd C:\Users\wlc\.gemini\antigravity\scratch\inno-autonomous-driving\frontend
npm run build
```
Confirms clean TypeScript compilation and Vite minification with zero errors.

---

## 3. MATLAB / Simulink Verification Harness
If MATLAB is installed:
```matlab
cd matlab_simulink/m_scripts
navadapt_run_simulink_cosim;
```
Verifies parameter loading, risk assessment scoring, and Frenet polynomial trajectory generation inside MATLAB workspace.
