# Mathematical & Algorithmic Reference

## 1. Frenet-Serret Frame Decomposition
In unstructured environments, the system constructs a smooth natural cubic spline $\vec{r}(s) = [x_r(s), y_r(s)]^T$ parameterized by arc-length $s$.

Any world point $\vec{x} = [x, y]^T$ is mapped into longitudinal position $s$ and orthogonal lateral displacement $d$:
$$\vec{x}(s, d) = \vec{r}(s) + d \cdot \vec{n}(s)$$
where $\vec{n}(s) = [-\sin\theta(s), \cos\theta(s)]^T$ is the unit normal vector.

### Cartesian to Frenet Conversion:
$$s = \arg\min_{\sigma} \|\vec{x} - \vec{r}(\sigma)\|^2$$
$$d = (\vec{x} - \vec{r}(s)) \times \vec{t}(s) = (x - x_r)\cos\theta - (y - y_r)\sin\theta$$

---

## 2. 1D Quintic Polynomial Boundary Value Solver
To ensure zero jerk discontinuities during sudden evasions, candidate paths are generated as 5th-degree polynomials:
$$p(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3 + a_4 t^4 + a_5 t^5$$
$$\dot{p}(t) = a_1 + 2 a_2 t + 3 a_3 t^2 + 4 a_4 t^3 + 5 a_5 t^4$$
$$\ddot{p}(t) = 2 a_2 + 6 a_3 t + 12 a_4 t^2 + 20 a_5 t^3$$
$$\dddot{p}(t) = 6 a_3 + 24 a_4 t + 60 a_5 t^2$$

Boundary conditions at $t = 0$:
$$a_0 = p_0, \quad a_1 = \dot{p}_0, \quad a_2 = \frac{1}{2}\ddot{p}_0$$

Boundary conditions at $t = T$ solved in closed form:
$$\begin{bmatrix} T^3 & T^4 & T^5 \\ 3T^2 & 4T^3 & 5T^4 \\ 6T & 12T^2 & 20T^3 \end{bmatrix} \begin{bmatrix} a_3 \\ a_4 \\ a_5 \end{bmatrix} = \begin{bmatrix} p_T - a_0 - a_1 T - a_2 T^2 \\ \dot{p}_T - a_1 - 2a_2 T \\ \ddot{p}_T - 2a_2 \end{bmatrix}$$

---

## 3. Multi-Objective Trajectory Cost Function
$$J(k) = k_j J_{jerk} + k_t T + k_d (d_T - d_{target})^2 + k_v (v_T - v_{target})^2 + k_b D_{boundary}^{-1} + k_r R_{path}$$

- $J_{jerk} = \int_0^T (\dddot{s}(t)^2 + \dddot{d}(t)^2) dt$
- Configured Weights:
  - $k_j = 0.10$ (Comfort & stability)
  - $k_t = 0.20$ (Time efficiency)
  - $k_d = 1.00$ (Lateral tracking error)
  - $k_v = 1.00$ (Speed regulation)
  - $k_b = 1.50$ (Boundary / pothole barrier)
  - $k_r = 2.00$ (Obstacle risk penalty)

---

## 4. Dynamic Risk Assessment Formulation ($R \in [0, 100]$)
For each surrounding agent $i$:
$$R_i = \left( w_d R_{dist} + w_v R_{vel} + w_{ttc} R_{ttc} + w_o R_{overlap} + w_c C_{vuln} \right) \cdot \text{confidence}_i$$

1. **Distance Risk ($R_{dist}$)**:
   $$R_{dist} = \begin{cases} 100 & \text{if } d_i < 8.0\,\text{m} \\ 100 \cdot \left(1 - \frac{d_i - 8.0}{22.0}\right) & \text{if } 8.0 \le d_i \le 30.0\,\text{m} \\ 0 & \text{if } d_i > 30.0\,\text{m} \end{cases}$$

2. **Closing Velocity Risk ($R_{vel}$)**:
   $$R_{vel} = \min\left(100, \frac{v_{closing}}{12.0} \cdot 100\right)$$

3. **Time-to-Collision Risk ($R_{ttc}$)**:
   $$R_{ttc} = \begin{cases} 100 & \text{if } \text{TTC} \le 1.5\,\text{s} \\ 100 \cdot \frac{4.0 - \text{TTC}}{4.0 - 1.5} & \text{if } 1.5 < \text{TTC} \le 4.0\,\text{s} \\ 0 & \text{if } \text{TTC} > 4.0\,\text{s} \end{cases}$$

4. **Trajectory Overlap Risk ($R_{overlap}$)**:
   Measures swept collision volume between ego planned path and agent predicted hypotheses:
   $$R_{overlap} = \max_h \left[ \left(1 - \frac{\text{dist}_{min}(p_{ego}, p_{h})}{d_{safe}}\right) \cdot 100 \cdot P(h) \right]$$

5. **Vulnerability Multipliers ($C_{vuln}$)**:
   - Pedestrian: 1.50
   - Stray Cattle / Animal: 1.35
   - Hand Pushcart: 1.25
   - Two-Wheeler / Rickshaw: 1.20 / 1.10
   - Heavy Commercial Vehicle: 1.40

---

## 5. Stanley Lateral Steering Controller
$$\delta(t) = \theta_e(t) + \arctan\left( \frac{k_e \cdot e_{fa}(t)}{v(t) + \epsilon} \right)$$
- Heading error: $\theta_e = \psi_{path} - \psi_{ego}$
- Cross-track error at front axle: $e_{fa} = (x_{fa} - x_{ref})\sin\psi_{ref} - (y_{fa} - y_{ref})\cos\psi_{ref}$
- Front axle projection: $x_{fa} = x + L \cos\psi, \quad y_{fa} = y + L \sin\psi$
- Gain: $k_e = 1.20$
- Low-speed regularization: $\epsilon = 0.50\,\text{m/s}$ (Eliminates division-by-zero singularity during crawl stops).
