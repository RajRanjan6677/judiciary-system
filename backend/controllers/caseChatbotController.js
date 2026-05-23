import Case from "../models/case.model.js";
import CaseChatMessage from "../models/caseChatMessage.model.js";
import { getChatbotResponse } from "../services/caseChatbotService.js";

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

export const askQuestion = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({ message: "Question is required" });
        }

        if (question.length > 500) {
            return res.status(400).json({ message: "Question exceeds 500 characters limit" });
        }

        const caseCheck = await checkCaseAccess(req, caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        // Save user message
        const userMessage = await CaseChatMessage.create({
            caseId,
            userId: req.user.id,
            role: "user",
            message: question
        });

        // Get AI response
        const answer = await getChatbotResponse(caseId, question);

        // Save AI response
        const aiMessage = await CaseChatMessage.create({
            caseId,
            userId: req.user.id,
            role: "ai",
            message: answer
        });

        res.status(200).json({
            answer,
            caseId,
            generatedAt: aiMessage.createdAt
        });

    } catch (error) {
        console.error("Error in caseChatbotController askQuestion:", error);
        res.status(500).json({ message: "Failed to process question", error: error.message });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { caseId } = req.params;

        const caseCheck = await checkCaseAccess(req, caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        const history = await CaseChatMessage.find({ caseId, userId: req.user.id })
            .sort({ createdAt: 1 });

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

export const clearChatHistory = async (req, res) => {
    try {
        const { caseId } = req.params;

        const caseCheck = await checkCaseAccess(req, caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        await CaseChatMessage.deleteMany({ caseId, userId: req.user.id });

        res.status(200).json({ message: "Chat history cleared successfully" });
    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ message: "Failed to clear chat history" });
    }
};
