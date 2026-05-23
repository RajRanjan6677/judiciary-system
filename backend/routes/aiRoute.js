import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

import CaseAISummary from "../models/caseAISummary.model.js";
import Case from "../models/case.model.js";
import { generateCaseSummary } from "../services/geminiService.js";

// Import new feature controllers
import { askQuestion, getChatHistory, clearChatHistory } from "../controllers/caseChatbotController.js";
import { fetchCaseInclination } from "../controllers/caseInclinationController.js";

const route = express.Router();

const checkCaseAccess = async (req, res, caseId) => {
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

// =======================
// Case Summary Routes
// =======================
// GET /api/ai/case-summary/:caseId - Get existing AI summary
route.get("/case-summary/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), async (req, res) => {
    try {
        const caseCheck = await checkCaseAccess(req, res, req.params.caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        const aiSummary = await CaseAISummary.findOne({ caseId: req.params.caseId }).populate("generatedBy", "username role");
        res.json(aiSummary); // Return null if not found, frontend can handle
    } catch (error) {
        console.error("Error fetching AI summary:", error);
        res.status(500).json({ message: "Failed to fetch AI summary" });
    }
});

// POST /api/ai/case-summary/:caseId - Generate or Regenerate AI summary
route.post("/case-summary/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), async (req, res) => {
    try {
        const caseCheck = await checkCaseAccess(req, res, req.params.caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        // Call Gemini Service
        const summaryText = await generateCaseSummary(req.params.caseId);

        // Save or update in DB
        let aiSummary = await CaseAISummary.findOne({ caseId: req.params.caseId });
        
        if (aiSummary) {
            aiSummary.summary = summaryText;
            aiSummary.generatedBy = req.user.id;
            aiSummary.generatedForRole = req.user.role;
            await aiSummary.save();
        } else {
            aiSummary = await CaseAISummary.create({
                caseId: req.params.caseId,
                summary: summaryText,
                generatedBy: req.user.id,
                generatedForRole: req.user.role
            });
        }

        res.status(201).json(aiSummary);
    } catch (error) {
        console.error("Error generating AI summary:", error);
        res.status(500).json({ message: "Failed to generate AI summary", error: error.message });
    }
});


// =======================
// Case Chatbot Routes
// =======================
route.get("/chatbot/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), getChatHistory);
route.post("/chatbot/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), askQuestion);
route.delete("/chatbot/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), clearChatHistory);


// =======================
// Case Inclination Route
// =======================
route.get("/case-inclination/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), fetchCaseInclination);


export default route;
