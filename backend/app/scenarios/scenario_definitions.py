import math
from typing import Dict, List, Any
from ..models.schemas import Scenario, VehicleState, RoadBoundary, ObjectClass

def create_unmarked_village_road() -> Scenario:
    # 200m narrow village road (width 5.5m), undulating edges
    length = 200.0
    left_bound = []
    right_bound = []
    step = 5.0
    for x in range(0, int(length) + 1, int(step)):
        fx = float(x)
        # Undulating natural dirt shoulder
        y_left = 3.0 + 0.4 * math.sin(fx * 0.05)
        y_right = -3.0 - 0.4 * math.cos(fx * 0.04)
        left_bound.append([fx, round(y_left, 2)])
        right_bound.append([fx, round(y_right, 2)])

    potholes = [
        {"id": "pot_1", "x": 52.0, "y": 0.4, "radius": 0.6, "depth_cm": 12.0},
        {"id": "pot_2", "x": 110.0, "y": -0.5, "radius": 0.5, "depth_cm": 9.0}
    ]

    objects = [
        # Pedestrian walking on road verge
        {"id": "ped_village_1", "class_name": ObjectClass.PEDESTRIAN, "x": 35.0, "y": 2.2, "vx": 0.8, "vy": -0.1, "length": 0.6, "width": 0.6, "height": 1.7},
        # Wandering cow grazing by shoulder
        {"id": "cattle_village_1", "class_name": ObjectClass.ANIMAL, "x": 75.0, "y": -2.4, "vx": 0.2, "vy": 0.3, "length": 2.2, "width": 1.0, "height": 1.5},
        # Oncoming motorcycle
        {"id": "moto_village_1", "class_name": ObjectClass.MOTORCYCLE, "x": 120.0, "y": 1.2, "vx": -7.0, "vy": 0.0, "length": 1.9, "width": 0.8, "height": 1.3},
        # Static cycle cart / stall
        {"id": "pushcart_village_1", "class_name": ObjectClass.PUSHCART, "x": 145.0, "y": 2.0, "vx": 0.0, "vy": 0.0, "length": 2.2, "width": 1.3, "height": 1.2}
    ]

    return Scenario(
        id="scenario_1",
        name="unmarked_village_road",
        title="Unmarked Village Road (Gramin Sadak)",
        description="Single-lane rural road with no lane markings, natural uneven dirt shoulders, roaming cattle, oncoming two-wheeler, and severe potholes.",
        difficulty="High",
        traffic_density="Medium Heterogeneous",
        road_type="rural_unmarked",
        road_length=length,
        road_width=6.0,
        main_hazards=["Missing Lane Markings", "Edge Erosion", "Deep Potholes", "Grazing Cattle", "Oncoming Motorcycle"],
        initial_ego_state=VehicleState(x=0.0, y=0.0, vx=7.0, v=7.0, yaw=0.0),
        target_destination={"x": 185.0, "y": 0.0},
        initial_objects=objects,
        road_boundaries=RoadBoundary(left_boundary=left_bound, right_boundary=right_bound, potholes=potholes)
    )

def create_unsignalized_urban_intersection() -> Scenario:
    length = 160.0
    left_bound = []
    right_bound = []
    # Intersection zone from x = 60 to x = 100
    for x in range(0, int(length) + 1, 5):
        fx = float(x)
        if 60 <= fx <= 100:
            # Wide opening for 4-way crossroad
            left_bound.append([fx, 14.0])
            right_bound.append([fx, -14.0])
        else:
            left_bound.append([fx, 4.5])
            right_bound.append([fx, -4.5])

    objects = [
        # Auto-rickshaw turning informally across intersection
        {"id": "auto_rickshaw_1", "class_name": ObjectClass.AUTO_RICKSHAW, "x": 75.0, "y": 10.0, "vx": 1.5, "vy": -3.5, "length": 2.6, "width": 1.3, "height": 1.8},
        # Crossing motorcycle cutting diagonally
        {"id": "moto_cross_1", "class_name": ObjectClass.MOTORCYCLE, "x": 68.0, "y": -9.0, "vx": 2.0, "vy": 4.5, "length": 1.9, "width": 0.8, "height": 1.3},
        # Crossing pedestrians
        {"id": "ped_group_1", "class_name": ObjectClass.PEDESTRIAN, "x": 88.0, "y": -6.0, "vx": 0.0, "vy": 1.2, "length": 0.7, "width": 0.7, "height": 1.7},
        # City bus waiting to enter
        {"id": "city_bus_1", "class_name": ObjectClass.BUS, "x": 92.0, "y": 8.0, "vx": -1.0, "vy": -2.0, "length": 9.5, "width": 2.6, "height": 3.2}
    ]

    return Scenario(
        id="scenario_2",
        name="unsignalized_intersection",
        title="Busy Unsignalized Urban Intersection",
        description="Chaotic multi-agent intersection with informal merging, turning auto-rickshaws, diagonal two-wheeler filtering, and pedestrian clusters without signals.",
        difficulty="Extreme",
        traffic_density="High Density Dynamic",
        road_type="intersection",
        road_length=length,
        road_width=9.0,
        main_hazards=["Informal Right-of-Way", "Auto-rickshaw Cut-In", "Diagonal Two-Wheelers", "Occluded Cross-Traffic"],
        initial_ego_state=VehicleState(x=10.0, y=0.0, vx=6.5, v=6.5, yaw=0.0),
        target_destination={"x": 150.0, "y": 0.0},
        initial_objects=objects,
        road_boundaries=RoadBoundary(left_boundary=left_bound, right_boundary=right_bound)
    )

def create_highway_merge() -> Scenario:
    length = 240.0
    left_bound = []
    right_bound = []
    for x in range(0, int(length) + 1, 5):
        fx = float(x)
        # Entry ramp merges from right between x=30 to x=90
        left_bound.append([fx, 6.0])
        if fx < 70:
            right_bound.append([fx, -9.0 + (fx / 70.0) * 3.0])
        else:
            right_bound.append([fx, -6.0])

    objects = [
        # Slow overloaded commercial truck in slow lane
        {"id": "heavy_truck_1", "class_name": ObjectClass.TRUCK, "x": 65.0, "y": -2.0, "vx": 6.5, "vy": 0.0, "length": 11.0, "width": 2.8, "height": 3.6},
        # Fast moving passenger car in fast lane
        {"id": "fast_car_1", "class_name": ObjectClass.CAR, "x": 110.0, "y": 2.5, "vx": 18.0, "vy": 0.0, "length": 4.5, "width": 1.9, "height": 1.5},
        # Motorcycle weaving between lanes
        {"id": "weaving_moto_1", "class_name": ObjectClass.MOTORCYCLE, "x": 40.0, "y": 0.5, "vx": 10.5, "vy": -0.3, "length": 1.9, "width": 0.8, "height": 1.3}
    ]

    return Scenario(
        id="scenario_3",
        name="highway_merge",
        title="National Highway Semi-Structured Merge",
        description="High-speed corridor with an overloaded slow-moving truck, agile lane-splitting motorcycle, and ego merging into active mainline traffic.",
        difficulty="Medium",
        traffic_density="High Velocity Mixed",
        road_type="highway_merge",
        road_length=length,
        road_width=12.0,
        main_hazards=["Overloaded Slow Truck", "High Speed Differentials", "Lane-Splitting Two-Wheelers", "Ramp Taper"],
        initial_ego_state=VehicleState(x=0.0, y=-5.5, vx=10.0, v=10.0, yaw=0.08),
        target_destination={"x": 225.0, "y": 2.0},
        initial_objects=objects,
        road_boundaries=RoadBoundary(left_boundary=left_bound, right_boundary=right_bound)
    )

def create_dense_market() -> Scenario:
    length = 150.0
    left_bound = []
    right_bound = []
    for x in range(0, int(length) + 1, 5):
        fx = float(x)
        # Constricted market street (width ~4.2m)
        left_bound.append([fx, 2.5 + 0.2 * math.sin(fx * 0.1)])
        right_bound.append([fx, -2.5 - 0.2 * math.cos(fx * 0.1)])

    objects = [
        # Hand pushcart loaded with vegetables on left lane
        {"id": "market_pushcart_1", "class_name": ObjectClass.PUSHCART, "x": 28.0, "y": 1.0, "vx": 0.7, "vy": 0.0, "length": 2.2, "width": 1.2, "height": 1.3},
        # Parked motorcycles protruding into street
        {"id": "parked_bike_1", "class_name": ObjectClass.STATIC_OBSTACLE, "x": 45.0, "y": -1.6, "vx": 0.0, "vy": 0.0, "length": 1.8, "width": 0.9, "height": 1.1},
        # Darting pedestrian crossing between stalls
        {"id": "darting_ped_1", "class_name": ObjectClass.PEDESTRIAN, "x": 55.0, "y": 2.2, "vx": 0.2, "vy": -1.4, "length": 0.6, "width": 0.6, "height": 1.7},
        # Auto-rickshaw idling ahead
        {"id": "idling_auto_1", "class_name": ObjectClass.AUTO_RICKSHAW, "x": 80.0, "y": -0.5, "vx": 1.2, "vy": 0.0, "length": 2.6, "width": 1.3, "height": 1.8}
    ]

    return Scenario(
        id="scenario_4",
        name="dense_market",
        title="Dense Bazaar / Market Corridor",
        description="Extremely narrow street with encroachments, vegetable pushcarts, parked two-wheelers, and sudden pedestrian darting requiring continuous low-speed replanning.",
        difficulty="Extreme",
        traffic_density="Ultra-Dense Pedestrian / Micro-mobility",
        road_type="market_corridor",
        road_length=length,
        road_width=5.0,
        main_hazards=["Sub-4m Street Width", "Hand Pushcarts", "Darting Pedestrians", "Encroachments", "Frequent Occlusions"],
        initial_ego_state=VehicleState(x=0.0, y=0.0, vx=3.5, v=3.5, yaw=0.0),
        target_destination={"x": 135.0, "y": 0.0},
        initial_objects=objects,
        road_boundaries=RoadBoundary(left_boundary=left_bound, right_boundary=right_bound)
    )

def create_sudden_cattle_crossing() -> Scenario:
    length = 180.0
    left_bound = []
    right_bound = []
    for x in range(0, int(length) + 1, 5):
        fx = float(x)
        left_bound.append([fx, 4.0])
        right_bound.append([fx, -4.0])

    objects = [
        # Cow initially concealed on left shoulder, steps into ego lane at x=48
        {"id": "cattle_hazard_1", "class_name": ObjectClass.ANIMAL, "x": 48.0, "y": 3.2, "vx": 0.3, "vy": -1.2, "length": 2.4, "width": 1.1, "height": 1.6},
        # Trailing motorcycle behind ego
        {"id": "trailing_bike_1", "class_name": ObjectClass.MOTORCYCLE, "x": -15.0, "y": -0.8, "vx": 11.5, "vy": 0.0, "length": 1.9, "width": 0.8, "height": 1.3},
        # Oncoming car in other lane
        {"id": "oncoming_car_1", "class_name": ObjectClass.CAR, "x": 115.0, "y": 2.2, "vx": -9.0, "vy": 0.0, "length": 4.6, "width": 1.8, "height": 1.5}
    ]

    return Scenario(
        id="scenario_5",
        name="cattle_crossing",
        title="Sudden Cattle Crossing on Suburban Arterial",
        description="Ego cruising at 40 km/h (11 m/s) when a stray cow steps abruptly out from the blind shoulder into the vehicle corridor. Tests emergency stopping, clearance buffering, and safe resumption.",
        difficulty="High",
        traffic_density="Dynamic Unpredictable",
        road_type="suburban_arterial",
        road_length=length,
        road_width=8.0,
        main_hazards=["Sudden Animal Incursion", "Zero Reaction Margin", "Occluded Sightlines", "Oncoming Traffic Constraint"],
        initial_ego_state=VehicleState(x=0.0, y=0.0, vx=10.5, v=10.5, yaw=0.0),
        target_destination={"x": 165.0, "y": 0.0},
        initial_objects=objects,
        road_boundaries=RoadBoundary(left_boundary=left_bound, right_boundary=right_bound)
    )

SCENARIOS: Dict[str, Scenario] = {
    "scenario_1": create_unmarked_village_road(),
    "scenario_2": create_unsignalized_urban_intersection(),
    "scenario_3": create_highway_merge(),
    "scenario_4": create_dense_market(),
    "scenario_5": create_sudden_cattle_crossing(),
}
