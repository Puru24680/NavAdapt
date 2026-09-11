# Smart India Hackathon Technical Explanation & Roadmap

## 1. Problem Statement Context
**Title**: *“Adaptive Path Planning for Autonomous Vehicles in Unstructured Indian Road Conditions”*  
**Team / Project**: *NavAdapt — Adaptive Autonomous Navigation*

India has the world's second-largest road network, yet reports over 150,000 road fatalities annually. Automated driving systems developed in North America or Western Europe cannot function in India because they depend heavily on:
1. Clearly visible, painted lane dividers.
2. Centimeter-level accurate HD map baselines.
3. Structured, homogeneous vehicle interactions adhering strictly to lane disciplines.

On typical Indian roads:
- Over 70% of roads lack lane markings or exhibit severe paint degradation.
- Multi-class road users (auto-rickshaws, cycles, cattle, tractors, pushcarts) merge and filter opportunistically.
- Unsignaled intersections operate on non-verbal, emergent negotiation rather than strict rules of the road.

## 2. NavAdapt Innovations
1. **Free-Space Corridor Delineation**:
   Replaces line tracking with continuous polygon boundaries derived from LiDAR point returns and visual road verge contrasts.
2. **Multi-Hypothesis Intent Modeling**:
   Models erratic Indian traffic behavior as multi-modal probabilistic hypotheses rather than single lane-following paths.
3. **Dynamic 0–100 Composite Risk Estimation**:
   Evaluates distance, closing velocity, TTC, path overlap, and class vulnerability in real time.
4. **Sub-50ms Real-Time Replanning**:
   A sampling lattice generates dozens of jerk-optimal quintic polynomial trajectories in <15ms, selecting the safest path with boundary barrier repulsive forces.
5. **Stanley Control with Softening Term**:
   Eliminates the low-speed singular chatter of classical lateral controllers during market crawls or yielding maneuvers.

## 3. Known Limitations & Research Frontiers
- **Adverse Weather & Visual Occlusion**: Heavy Indian monsoon downpours degrade optical camera visibility; solved via 77 GHz FMCW radar and 3D LiDAR point clustering.
- **Micro-Negotiation**: In dense bazaars, human drivers communicate via horn taps, headlight flashes, and creep postures. Future versions will integrate a learned Reinforcement Learning social negotiation policy.
- **Edge Deployment**: Designed to compile to TensorRT / ONNX for execution on NVIDIA Jetson AGX Orin with ASIL-D lockstep safety microcontrollers.
