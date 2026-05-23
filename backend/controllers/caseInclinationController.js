import mongoose from "mongoose";
import Case from "../models/case.model.js";
import Log from "../models/log.model.js";
import { getCaseInclination } from "../services/caseInclinationService.js";

const checkCaseAccess = async (req, caseId) => {
    const caseExist = await Case.findById(caseId);
    if (!caseExist) return { error: true, status: 404, message: "Case not found" };

    if (req.user.role === "lawyer") {
        const isAssigned = caseExist.lawyerId && caseExist.lawyerId.toString() === req.user.id;
        if (!isAssigned) return { error: true, status: 403, message: "Unauthorized: not your assigned case" };
    }
    if (req.user.role === "judge") {
        const isAssigned = caseExist.judgeId && caseExist.judgeId.toString() === req.user.id;
        if (!isAssigned) return { error: true, status: 403, message: "Unauthorized: not your assigned case" };
    }
    return { error: false, caseExist };
};

export const fetchCaseInclination = async (req, res) => {
    try {
        const { caseId } = req.params;

        // Validate MongoDB ObjectId for caseId
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ success: false, message: "Invalid case ID format" });
        }

        // Verify role-based case access
        const caseCheck = await checkCaseAccess(req, caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ success: false, message: caseCheck.message });

        // Get Inclination
        const inclinationData = await getCaseInclination(caseId);

        // Append the disclaimer to the JSON before sending
        inclinationData.disclaimer = "This case inclination is system-generated from available case records only. It is not a legal decision or judgment.";

        // Save Audit Log
        try {
            await Log.create({
                action: "Generated Case Inclination Analysis",
                details: "System generated administrative case inclination analysis using available case records.",
                caseId: caseCheck.caseExist._id,
                performedBy: req.user.id
            });
        } catch (logError) {
            console.error("Failed to save audit log:", logError);
            // Non-fatal, continue returning response
        }

        res.status(200).json({
            success: true,
            data: inclinationData
        });
    } catch (error) {
        console.error("Error in fetchCaseInclination controller:", error);
        res.status(500).json({ success: false, message: "Failed to fetch case inclination analysis", error: error.message });
    }
};
