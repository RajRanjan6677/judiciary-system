import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import Case from "../models/case.model.js";
import Hearing from "../models/hearing.model.js";
import Log from "../models/log.model.js";
import { analyzeCasePriority } from "../utils/priorityCalculator.js";

const route = express.Router();

// GET /pending-priority
route.get("/pending-priority", protect, authorize("admin", "clerk", "lawyer", "judge"), async (req, res) => {
    try {
        let query = { status: "pending" };

        // RBAC Filtering
        if (req.user.role === "lawyer") {
            query.lawyerId = req.user.id;
        } else if (req.user.role === "judge") {
            query.judgeId = req.user.id;
        }

        const cases = await Case.find(query)
            .populate("judgeId", "username")
            .populate("lawyerId", "username email");

        // We need hearings for all these cases
        const caseIds = cases.map(c => c._id);
        const allHearings = await Hearing.find({ caseId: { $in: caseIds } });

        // Group hearings by caseId for fast lookup
        const hearingsByCase = {};
        allHearings.forEach(h => {
            const cId = h.caseId.toString();
            if (!hearingsByCase[cId]) hearingsByCase[cId] = [];
            hearingsByCase[cId].push(h);
        });

        const analyticsResults = cases.map(caseObj => {
            const caseHearings = hearingsByCase[caseObj._id.toString()] || [];
            return analyzeCasePriority(caseObj, caseHearings);
        });

        // Sort by Urgency Score descending
        analyticsResults.sort((a, b) => b.urgencyScore - a.urgencyScore);

        res.json(analyticsResults);
    } catch (error) {
        console.error("Error in /pending-priority", error);
        res.status(500).json({ message: "Failed to fetch priority analytics" });
    }
});

// PUT /cases/:caseId/assign-next-date
route.put("/cases/:caseId/assign-next-date", protect, authorize("admin", "clerk", "judge"), async (req, res) => {
    try {
        const { nextHearingDate } = req.body;
        if (!nextHearingDate) {
            return res.status(400).json({ message: "nextHearingDate is required" });
        }

        const caseExist = await Case.findById(req.params.caseId);
        if (!caseExist) return res.status(404).json({ message: "Case not found" });

        if (req.user.role === "judge") {
            const isAssigned = caseExist.judgeId && caseExist.judgeId.toString() === req.user.id;
            if (!isAssigned) return res.status(403).json({ message: "Unauthorized: not your assigned case" });
        }

        // Create a new hearing record to officially schedule it
        const newHearing = await Hearing.create({
            caseId: caseExist._id,
            date: nextHearingDate,
            remarks: "System Assigned Hearing (Priority Schedule)",
            createdBy: req.user.id
        });

        // Audit Log
        await Log.create({
            action: "Assigned Priority Hearing Date",
            details: `Assigned next hearing date ${new Date(nextHearingDate).toLocaleDateString()} via Smart Priority Dashboard`,
            caseId: caseExist._id,
            performedBy: req.user.id
        });

        res.status(200).json({ message: "Next hearing date assigned successfully", hearing: newHearing });
    } catch (error) {
        console.error("Error in assign-next-date", error);
        res.status(500).json({ message: "Failed to assign next hearing date" });
    }
});

export default route;
