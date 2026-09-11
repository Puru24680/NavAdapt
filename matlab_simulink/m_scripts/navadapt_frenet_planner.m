function [bestTrajectory, candidateTrajectories, minCost] = navadapt_frenet_planner(egoFrenet, targetSpeed, targetD, obstacles, weights)
% NAVADAPT_FRENET_PLANNER Generates collision-free quintic polynomial trajectories in Frenet frame.
%
% Inputs:
%   egoFrenet: [s0, s_d0, s_dd0, d0, d_d0, d_dd0]
%   targetSpeed: Target cruising speed [m/s]
%   targetD: Target lateral offset [m] (0 = centerline)
%   obstacles: Nx4 array [x, y, radius, vx]
%   weights: struct with fields (kJerk, kTime, kDiff, kVel)

    if nargin < 5
        weights.kJerk = 0.1;
        weights.kTime = 0.2;
        weights.kDiff = 1.0;
        weights.kVel  = 1.0;
    end

    s0 = egoFrenet(1); s_d0 = egoFrenet(2); s_dd0 = egoFrenet(3);
    d0 = egoFrenet(4); d_d0 = egoFrenet(5); d_dd0 = egoFrenet(6);

    d_samples = [targetD, targetD - 0.8, targetD + 0.8, targetD - 1.5, targetD + 1.5];
    t_samples = [2.0, 2.8, 3.5];
    v_samples = [targetSpeed, max(0, targetSpeed - 2.5), targetSpeed + 1.5];

    minCost = inf;
    bestTrajectory = [];
    candidateTrajectories = {};
    candCount = 0;

    for di = d_samples
        for Ti = t_samples
            % Lateral quintic polynomial
            latPoly = solve_quintic(d0, d_d0, d_dd0, di, 0.0, 0.0, Ti);

            for vi = v_samples
                % Longitudinal quintic polynomial
                si = s0 + vi * Ti;
                lonPoly = solve_quintic(s0, s_d0, s_dd0, si, vi, 0.0, Ti);

                % Discretize trajectory
                dt = 0.1;
                t = 0:dt:Ti;
                s_vals = polyval_quintic(lonPoly, t);
                d_vals = polyval_quintic(latPoly, t);
                s_vels = polyval_deriv(lonPoly, t);
                d_vels = polyval_deriv(latPoly, t);
                s_jerks = polyval_jerk(lonPoly, t);
                d_jerks = polyval_jerk(latPoly, t);

                % Cost calculation
                jerkCost = sum(s_jerks.^2 + d_jerks.^2) * dt;
                cost = weights.kJerk * jerkCost + ...
                       weights.kTime * Ti + ...
                       weights.kDiff * (di - targetD)^2 + ...
                       weights.kVel  * (vi - targetSpeed)^2;

                % Simple collision check
                collision = false;
                if ~isempty(obstacles)
                    for k = 1:length(t)
                        obsDist = hypot(s_vals(k) - obstacles(:,1), d_vals(k) - obstacles(:,2));
                        if any(obsDist < (obstacles(:,3) + 1.2))
                            collision = true;
                            break;
                        end
                    end
                end

                if ~collision
                    candCount = candCount + 1;
                    candTraj = [s_vals', d_vals', s_vels', t'];
                    candidateTrajectories{candCount} = candTraj; %#ok<AGROW>

                    if cost < minCost
                        minCost = cost;
                        bestTrajectory = candTraj;
                    end
                end
            end
        end
    end
end

function poly = solve_quintic(x0, v0, a0, x1, v1, a1, T)
    A = [T^3,   T^4,    T^5;
         3*T^2, 4*T^3,  5*T^4;
         6*T,   12*T^2, 20*T^3];
    b = [x1 - x0 - v0*T - 0.5*a0*T^2;
         v1 - v0 - a0*T;
         a1 - a0];
    x = A \ b;
    poly = [x0, v0, 0.5*a0, x(1), x(2), x(3)];
end

function val = polyval_quintic(p, t)
    val = p(1) + p(2)*t + p(3)*t.^2 + p(4)*t.^3 + p(5)*t.^4 + p(6)*t.^5;
end

function val = polyval_deriv(p, t)
    val = p(2) + 2*p(3)*t + 3*p(4)*t.^2 + 4*p(5)*t.^3 + 5*p(6)*t.^4;
end

function val = polyval_jerk(p, t)
    val = 6*p(4) + 24*p(5)*t + 60*p(6)*t.^2;
end
