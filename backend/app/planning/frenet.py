import math
import numpy as np
from typing import List, Tuple
from ..models.schemas import PathPoint

class CubicSpline1D:
    """Natural cubic spline interpolation for 1D path."""
    def __init__(self, x: List[float], y: List[float]):
        self.x = list(x)
        self.y = list(y)
        self.nx = len(x)
        h = np.diff(x)

        self.a = list(y)
        A = np.zeros((self.nx, self.nx))
        B = np.zeros(self.nx)

        A[0, 0] = 1.0
        for i in range(self.nx - 1):
            if i != (self.nx - 2):
                A[i + 1, i + 1] = 2.0 * (h[i] + h[i + 1])
            A[i + 1, i] = h[i]
            A[i, i + 1] = h[i]
            if i != 0:
                B[i] = 3.0 * (self.a[i + 1] - self.a[i]) / h[i] - 3.0 * (self.a[i] - self.a[i - 1]) / h[i - 1]

        A[0, 1] = 0.0
        A[self.nx - 1, self.nx - 2] = 0.0
        A[self.nx - 1, self.nx - 1] = 1.0

        self.c = np.linalg.solve(A, B)
        self.b = []
        self.d = []
        for i in range(self.nx - 1):
            self.b.append((self.a[i + 1] - self.a[i]) / h[i] - h[i] * (2.0 * self.c[i] + self.c[i + 1]) / 3.0)
            self.d.append((self.c[i + 1] - self.c[i]) / (3.0 * h[i]))

    def calc_position(self, x: float) -> float:
        if x < self.x[0] or x > self.x[-1]:
            # Extrapolate linearly
            if x < self.x[0]:
                return self.y[0] + (x - self.x[0]) * ((self.y[1] - self.y[0]) / (self.x[1] - self.x[0] + 1e-6))
            else:
                return self.y[-1] + (x - self.x[-1]) * ((self.y[-1] - self.y[-2]) / (self.x[-1] - self.x[-2] + 1e-6))

        idx = self._search_index(x)
        dx = x - self.x[idx]
        return self.a[idx] + self.b[idx] * dx + self.c[idx] * dx**2 + self.d[idx] * dx**3

    def calc_first_derivative(self, x: float) -> float:
        if x < self.x[0] or x > self.x[-1]:
            return 0.0
        idx = self._search_index(x)
        dx = x - self.x[idx]
        return self.b[idx] + 2.0 * self.c[idx] * dx + 3.0 * self.d[idx] * dx**2

    def calc_second_derivative(self, x: float) -> float:
        if x < self.x[0] or x > self.x[-1]:
            return 0.0
        idx = self._search_index(x)
        dx = x - self.x[idx]
        return 2.0 * self.c[idx] + 6.0 * self.d[idx] * dx

    def _search_index(self, x: float) -> int:
        return max(0, min(self.nx - 2, int(np.searchsorted(self.x, x) - 1)))


class CubicSpline2D:
    """2D reference path parameterization with arc-length s."""
    def __init__(self, x: List[float], y: List[float]):
        self.s = self._calc_s(x, y)
        self.sx = CubicSpline1D(self.s, x)
        self.sy = CubicSpline1D(self.s, y)

    def _calc_s(self, x: List[float], y: List[float]) -> List[float]:
        dx = np.diff(x)
        dy = np.diff(y)
        ds = np.hypot(dx, dy)
        s = [0.0]
        s.extend(np.cumsum(ds))
        return s

    def calc_position(self, s: float) -> Tuple[float, float]:
        return self.sx.calc_position(s), self.sy.calc_position(s)

    def calc_yaw(self, s: float) -> float:
        dx = self.sx.calc_first_derivative(s)
        dy = self.sy.calc_first_derivative(s)
        return math.atan2(dy, dx)

    def calc_curvature(self, s: float) -> float:
        dx = self.sx.calc_first_derivative(s)
        ddx = self.sx.calc_second_derivative(s)
        dy = self.sy.calc_first_derivative(s)
        ddy = self.sy.calc_second_derivative(s)
        den = (dx**2 + dy**2)**1.5
        if den < 1e-6:
            return 0.0
        return (ddy * dx - ddx * dy) / den

    def to_frenet(self, x: float, y: float, s_guess: float = 0.0) -> Tuple[float, float]:
        """Converts Cartesian (x, y) to Frenet (s, d)."""
        # Local search around s_guess
        s_min = max(0.0, s_guess - 20.0)
        s_max = min(self.s[-1], s_guess + 30.0)
        s_samples = np.linspace(s_min, s_max, 50)

        best_s = s_guess
        min_dist_sq = float('inf')
        for s_i in s_samples:
            px, py = self.calc_position(s_i)
            d_sq = (px - x)**2 + (py - y)**2
            if d_sq < min_dist_sq:
                min_dist_sq = d_sq
                best_s = s_i

        # Refine with Golden Section or small step
        rx, ry = self.calc_position(best_s)
        ryaw = self.calc_yaw(best_s)
        dx = x - rx
        dy = y - ry
        # Sign of d is cross product: rx'*dy - ry'*dx
        cross = math.cos(ryaw) * dy - math.sin(ryaw) * dx
        d = math.hypot(dx, dy) * (1.0 if cross >= 0 else -1.0)
        return best_s, d

    def to_cartesian(self, s: float, d: float) -> Tuple[float, float, float, float]:
        """Converts Frenet (s, d) to Cartesian (x, y, yaw, kappa)."""
        rx, ry = self.calc_position(s)
        ryaw = self.calc_yaw(s)
        rkappa = self.calc_curvature(s)

        # Normal vector: [-sin(yaw), cos(yaw)]
        x = rx - d * math.sin(ryaw)
        y = ry + d * math.cos(ryaw)
        return x, y, ryaw, rkappa
