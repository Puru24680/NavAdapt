function [overallRisk, riskLevel, minTTC, agentRisks] = navadapt_risk_assessment_algo(egoState, trackedObjects, plannedTrajectory, weights)
% NAVADAPT_RISK_ASSESSMENT_ALGO Evaluates composite 0-100 risk score for unstructured Indian roads.
%
% Inputs:
%   egoState: struct with fields (x, y, vx, vy, v, yaw, length, width)
%   trackedObjects: array of structs with fields (id, class, x, y, vx, vy, confidence, length, width)
%   plannedTrajectory: Nx3 array of [x, y, t] planned trajectory points
%   weights: struct with fields (Distance, Velocity, TTC, Overlap, Vulnerability)
%
% Outputs:
%   overallRisk: Normalized score in range [0, 100]
%   riskLevel: String ('Safe', 'Caution', 'High Risk', 'Critical')
%   minTTC: Minimum time-to-collision across all detected road users
%   agentRisks: struct array of individual evaluations

    if nargin < 4
        weights.Distance = 0.25;
        weights.Velocity = 0.15;
        weights.TTC = 0.35;
        weights.Overlap = 0.15;
        weights.Vulnerability = 0.10;
    end

    numObjs = length(trackedObjects);
    overallRisk = 0.0;
    minTTC = 99.0;
    agentRisks = repmat(struct('id', '', 'score', 0, 'ttc', 99, 'level', 'Safe'), numObjs, 1);

    % Class vulnerability factors
    vulnMap = containers.Map({'pedestrian', 'animal', 'pushcart', 'motorcycle', 'auto_rickshaw', 'car', 'truck'}, ...
                             [1.50,         1.35,     1.25,       1.20,         1.10,            1.00,  1.40]);

    for i = 1:numObjs
        obj = trackedObjects(i);
        dx = obj.x - egoState.x;
        dy = obj.y - egoState.y;
        dist = hypot(dx, dy);

        % Closing velocity along line-of-sight
        relVx = egoState.vx - obj.vx;
        relVy = egoState.vy - obj.vy;
        closingSpeed = (dx * relVx + dy * relVy) / (dist + 1e-6);

        % Time-to-Collision (TTC)
        if closingSpeed > 0.1
            ttc = max(0.01, dist / closingSpeed);
        else
            ttc = 99.0;
        end
        if ttc < minTTC
            minTTC = ttc;
        end

        % 1. Distance Risk
        if dist < 8.0
            distRisk = 100.0;
        elseif dist < 30.0
            distRisk = 100.0 * (1.0 - (dist - 8.0) / 22.0);
        else
            distRisk = 0.0;
        end

        % 2. Velocity Risk
        if closingSpeed > 0.0
            speedRisk = min(100.0, (closingSpeed / 12.0) * 100.0);
        else
            speedRisk = 0.0;
        end

        % 3. TTC Risk
        if ttc <= 1.5
            ttcRisk = 100.0;
        elseif ttc <= 4.0
            ttcRisk = 100.0 * ((4.0 - ttc) / (4.0 - 1.5));
        else
            ttcRisk = 0.0;
        end

        % 4. Trajectory Overlap
        overlapRisk = 0.0;
        if abs(dy) < 1.8 && dist < 25.0 && closingSpeed > 0
            overlapRisk = min(100.0, (1.0 - abs(dy) / 1.8) * 90.0);
        end

        % 5. Vulnerability
        if isKey(vulnMap, obj.class)
            vulnWeight = vulnMap(obj.class);
        else
            vulnWeight = 1.0;
        end
        vulnScore = min(100.0, (vulnWeight - 1.0) * 150.0 + 30.0);

        % Composite Score
        composite = (weights.Distance * distRisk + ...
                     weights.Velocity * speedRisk + ...
                     weights.TTC * ttcRisk + ...
                     weights.Overlap * overlapRisk + ...
                     weights.Vulnerability * vulnScore) * obj.confidence;

        composite = max(0.0, min(100.0, composite));

        if composite >= 75.0
            lvl = 'Critical';
        elseif composite >= 50.0
            lvl = 'High Risk';
        elseif composite >= 25.0
            lvl = 'Caution';
        else
            lvl = 'Safe';
        end

        agentRisks(i).id = obj.id;
        agentRisks(i).score = composite;
        agentRisks(i).ttc = ttc;
        agentRisks(i).level = lvl;

        if composite > overallRisk
            overallRisk = composite;
        end
    end

    if overallRisk >= 75.0
        riskLevel = 'Critical';
    elseif overallRisk >= 50.0
        riskLevel = 'High Risk';
    elseif overallRisk >= 25.0
        riskLevel = 'Caution';
    else
        riskLevel = 'Safe';
    end
end
