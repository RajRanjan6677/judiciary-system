import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { askQuestion, getChatHistory, clearChatHistory } from "../controllers/caseChatbotController.js";

const route = express.Router();

// GET /api/ai/chatbot/:caseId - Get chat history
route.get("/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), getChatHistory);

// POST /api/ai/chatbot/:caseId - Ask a question
route.post("/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), askQuestion);

// DELETE /api/ai/chatbot/:caseId - Clear chat history
route.delete("/:caseId", protect, authorize("admin", "lawyer", "judge", "clerk"), clearChatHistory);

export default route;
