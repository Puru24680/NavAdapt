%% =========================================================================
%% NavAdapt — Adaptive Autonomous Navigation
%% Smart India Hackathon: Adaptive Path Planning in Unstructured Indian Roads
%% Vehicle Dynamics & Simulation Parameters (Automated Driving Toolbox / Simulink)
%% =========================================================================

clear; clc;

%% 1. Vehicle Mechanical Parameters (Passenger Sedan / C-Segment SUV)
Vehicle = struct();
Vehicle.Mass            = 1650.0;    % Total curb mass [kg]
Vehicle.Iz              = 2700.0;    % Yaw moment of inertia [kg*m^2]
Vehicle.Wheelbase       = 2.70;      % Wheelbase L = lf + lr [m]
Vehicle.lf              = 1.20;      % CG to front axle [m]
Vehicle.lr              = 1.50;      % CG to rear axle [m]
Vehicle.TrackWidth      = 1.62;      % Track width [m]
Vehicle.FrontalArea     = 2.25;      % Frontal aerodynamic area [m^2]
Vehicle.Cd              = 0.32;      % Aerodynamic drag coefficient
Vehicle.Cr              = 0.015;     % Rolling resistance coefficient
Vehicle.MaxSteerDeg     = 35.0;      % Maximum steering wheel angle [deg]
Vehicle.MaxSteerRateDeg = 45.0;      % Steering actuator rate limit [deg/s]
Vehicle.MaxAccel        = 3.5;       % Maximum longitudinal acceleration [m/s^2]
Vehicle.MaxDecel        = 7.0;       % Maximum emergency deceleration [m/s^2]
Vehicle.WheelRadius     = 0.32;      % Effective rolling tire radius [m]

%% 2. Tire & Road Surface Characteristics (Pacejka Magic Formula / Linear)
Vehicle.Caf             = 95000;     % Front cornering stiffness [N/rad]
Vehicle.Car             = 110000;    % Rear cornering stiffness [N/rad]
Vehicle.MuAsphalt       = 0.85;      % Friction on standard paved asphalt
Vehicle.MuUnpavedDirt   = 0.55;      % Friction on Indian village dirt/shoulder

%% 3. Stanley Lateral Controller Parameters
Stanley = struct();
Stanley.ke              = 1.20;      % Cross-track error gain
Stanley.ksoft           = 0.50;      % Low-speed velocity regularization [m/s]
Stanley.MaxSteer        = deg2rad(Vehicle.MaxSteerDeg);

%% 4. Longitudinal PID Controller Parameters
LongPID = struct();
LongPID.Kp              = 0.85;      % Proportional gain
LongPID.Ki              = 0.05;      % Integral gain
LongPID.Kd              = 0.12;      % Derivative gain
LongPID.MaxJerk         = 3.00;      % Comfort jerk constraint [m/s^3]
LongPID.EmergencyDecel  = 6.50;      % Emergency brake deceleration [m/s^2]

%% 5. Multi-Factor Risk Assessment Weights (0 - 100 Scale)
RiskWeights = struct();
RiskWeights.Distance      = 0.25;
RiskWeights.Velocity      = 0.15;
RiskWeights.TTC           = 0.35;
RiskWeights.Overlap       = 0.15;
RiskWeights.Vulnerability = 0.10;

%% 6. Simulation & Solver Timers
SimConfig = struct();
SimConfig.Ts            = 0.05;      % Sample time dt = 50ms (20 Hz)
SimConfig.Solver        = 'ode4';    % Runge-Kutta 4th order fixed-step solver

fprintf('✓ NavAdapt Vehicle & Controller Parameters loaded successfully into MATLAB Workspace.\n');
