# Indian Road Scenarios & Benchmark Suite

## Scenario Matrix

| ID | Scenario Title | Road Width | Traffic Density | Primary Hazard | Key Pass Criterion |
|---|---|---|---|---|---|
| **SC-01** | Unmarked Village Road | 5.5m | Medium Heterogeneous | Grazing cattle, deep potholes, oncoming motorcycle | Safe pass with >1.2m buffer; 0 pothole strikes |
| **SC-02** | Unsignalized Urban Chowk | 9.0m | High Dynamic | Informal merging, auto cut-in, diagonal bikes | Right-of-way negotiation; zero deadlock; 0 collision |
| **SC-03** | National Highway Merge | 12.0m | High Velocity Mixed | Slow truck (6 m/s), weaving motorcycle | Speed matching; safe lane change; jerk < 1.5 m/s³ |
| **SC-04** | Dense Market Corridor | 4.2m | Ultra-Dense Pedestrian | Vegetable pushcart, parked bikes, darting pedestrians | Crawl speed (8 km/h); sub-50ms evasion |
| **SC-05** | Sudden Cattle Crossing | 8.0m | Unpredictable High-Speed | Stray cow steps into lane at 22m while cruising at 40 km/h | Controlled emergency stop at >2.0m buffer; resumption |

---

### SC-01: Unmarked Village Road (*Gramin Sadak*)
- **Context**: Rural roads connecting villages in Uttar Pradesh, Bihar, and Maharashtra. Undivided 5.5m asphalt with uneven, eroded dirt shoulders and no center line.
- **Dynamic Elements**:
  - Wandering cow grazing on verge ($x=75\,\text{m}$).
  - Oncoming motorcycle at $7\,\text{m/s}$ traveling along center line ($x=120\,\text{m}$).
  - Stationary vegetable cycle cart on left edge ($x=145\,\text{m}$).
  - Severe pothole ($12\,\text{cm}$ deep) at $x=52\,\text{m}, y=0.4\,\text{m}$.
- **Autonomous Strategy**:
  - Planner identifies drivable free-space boundary from dirt verge.
  - Detects pothole and applies boundary repulsive cost, nudging $0.8\,\text{m}$ to the right.
  - Moderates speed to $6.5\,\text{m/s}$ when passing oncoming motorcycle with $1.4\,\text{m}$ clearance.

---

### SC-02: Busy Unsignalized Urban Intersection
- **Context**: Typical chaotic 4-way crossroad in Bengaluru / Old Delhi without working traffic signals.
- **Dynamic Elements**:
  - Turning auto-rickshaw entering informally from north approach ($vy = -3.5\,\text{m/s}$).
  - Motorcycle filtering diagonally from south approach ($vy = +4.5\,\text{m/s}$).
  - Pedestrian cluster crossing without crosswalk.
- **Autonomous Strategy**:
  - Behavior planner switches from `Follow` $\to$ `Slow Down` $\to$ `Yield`.
  - Vehicle inches forward at $2.5\,\text{m/s}$ into clear gap once auto-rickshaw completes turning arc.

---

### SC-03: National Highway Semi-Structured Merge
- **Context**: NH-48 arterial corridor with an entry slip ramp.
- **Dynamic Elements**:
  - Overloaded agricultural tractor/truck cruising at $6.5\,\text{m/s}$ in slow lane.
  - High-speed passenger car in fast lane ($18\,\text{m/s}$).
  - Motorcycle weaving between vehicles ($10.5\,\text{m/s}$).
- **Autonomous Strategy**:
  - Merges from ramp into mainline with speed harmonization ($10\,\text{m/s}$).
  - Senses slow truck ahead, verifies left passing lane is clear, and executes smooth lane change with jerk $< 1.2\,\text{m/s}^3$.

---

### SC-04: Dense Market (*Bazaar / Chowk*)
- **Context**: Narrow market lane (width $< 4.2\,\text{m}$) lined with roadside stalls, parked two-wheelers, and hand pushcarts.
- **Dynamic Elements**:
  - Hand pushcart occupying $1.2\,\text{m}$ of lane.
  - Parked motorcycle protruding $0.9\,\text{m}$.
  - Darting pedestrian stepping out from behind pushcart at $15\,\text{m}$ distance.
- **Autonomous Strategy**:
  - Low-speed creeping ($3.5\,\text{m/s}$).
  - EKF tracker detects pedestrian occlusion breakout in 1 frame.
  - Instant transition to `Stop` state with controlled deceleration.
  - Resumes crawl once pedestrian clears corridor.

---

### SC-05: Sudden Cattle Crossing
- **Context**: Suburban arterial road at twilight. Ego cruising at $40\,\text{km/h}$ ($11.1\,\text{m/s}$).
- **Dynamic Elements**:
  - Stray cow concealed on shoulder steps directly into lane at $x=48\,\text{m}, y=3.2\,\text{m}$.
  - Initial distance: $22\,\text{m}$.
- **Autonomous Strategy**:
  - Perception fuses Camera visual confirmation with LiDAR cluster.
  - Dynamic risk jumps from $18$ (Safe) to $89$ (Critical).
  - Behavior planner triggers `Emergency Brake` within $12\,\text{ms}$.
  - Controller applies $-6.0\,\text{m/s}^2$ braking.
  - Vehicle comes to a complete controlled stop at $2.5\,\text{m}$ clearance buffer from animal.
  - Waits for animal to cross and automatically replans smooth resumption.
