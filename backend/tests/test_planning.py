import math
import pytest
from app.planning.frenet import CubicSpline2D
from app.planning.local_planner import QuinticPolynomial, AdaptiveLocalPlanner
from app.models.schemas import VehicleState, BehaviorState

def test_cubic_spline_frenet():
    x = [0.0, 20.0, 50.0, 100.0]
    y = [0.0, 2.0, 0.0, -1.0]
    csp = CubicSpline2D(x, y)

    # Test conversion at origin
    s, d = csp.to_frenet(0.0, 0.0)
    assert abs(s) < 0.5
    assert abs(d) < 0.5

    # Test conversion back to Cartesian
    cx, cy, cyaw, ckappa = csp.to_cartesian(20.0, 0.0)
    assert math.isclose(cx, 20.0, abs_tol=1.0)

def test_quintic_polynomial():
    xs, vxs, axs = 0.0, 5.0, 0.0
    xe, vxe, axe = 20.0, 10.0, 0.0
    T = 2.0
    poly = QuinticPolynomial(xs, vxs, axs, xe, vxe, axe, T)

    # Start boundary condition
    assert math.isclose(poly.calc_point(0.0), xs, abs_tol=1e-4)
    assert math.isclose(poly.calc_first_derivative(0.0), vxs, abs_tol=1e-4)

    # End boundary condition
    assert math.isclose(poly.calc_point(T), xe, abs_tol=1e-4)
    assert math.isclose(poly.calc_first_derivative(T), vxe, abs_tol=1e-4)

def test_adaptive_local_planner():
    planner = AdaptiveLocalPlanner()
    x = [float(i) for i in range(0, 150, 10)]
    y = [0.0 for _ in x]
    csp = CubicSpline2D(x, y)

    ego = VehicleState(x=10.0, y=0.0, vx=8.0, v=8.0, yaw=0.0)
    behavior = {"target_speed": 10.0, "target_lateral_offset": 0.0, "state": BehaviorState.FOLLOW}

    traj, candidates, latency = planner.plan(ego, behavior, csp, [], [])
    assert len(traj.points) > 0
    assert latency < 100.0 # Sub-100ms
    assert traj.points[-1].x > traj.points[0].x
    assert math.isclose(traj.points[0].x, 10.0, abs_tol=1.0)
