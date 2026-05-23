import { GoogleGenerativeAI } from "@google/generative-ai";
import Case from "../models/case.model.js";
import Hearing from "../models/hearing.model.js";
import HearingRecord from "../models/hearingRecord.model.js";
import Document from "../models/document.model.js";
import Log from "../models/log.model.js";

/**
 * Handles interactions with Gemini for the AI Case Chatbot.
 * @param {string} caseId - The ID of the case
 * @param {string} question - The user's question
 * @returns {Promise<string>} The generated answer
 */
export const getChatbotResponse = async (caseId, question) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured in .env");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Fetch all relevant data
        const caseDetails = await Case.findById(caseId)
            .populate('judgeId', 'username')
            .populate('lawyerId', 'username');
        
        if (!caseDetails) throw new Error("Case not found");

        const hearings = await Hearing.find({ caseId }).sort({ date: 1 });
        const hearingRecords = await HearingRecord.find({ caseId }).sort({ hearingDate: 1 }).populate('recordedBy', 'username role');
        const documents = await Document.find({ caseId }).sort({ createdAt: 1 });
        const logs = await Log.find({ caseId }).sort({ createdAt: 1 }).populate('performedBy', 'username role');

        // 2. Format the data into a readable object/string for the AI
        const caseData = {
            caseNumber: caseDetails.caseNumber,
            title: caseDetails.title,
            description: caseDetails.description,
            category: caseDetails.caseCategory,
            status: caseDetails.status,
            assignedJudge: caseDetails.judgeId ? caseDetails.judgeId.username : "Unassigned",
            assignedLawyer: caseDetails.lawyerId ? caseDetails.lawyerId.username : "Unassigned",
            summary: caseDetails.summary,
            createdAt: caseDetails.createdAt,
            hearings: hearings.map(h => ({
                date: new Date(h.date).toLocaleDateString(),
                remarks: h.remarks,
                nextHearingDate: h.nextHearingDate ? new Date(h.nextHearingDate).toLocaleDateString() : null
            })),
            hearingRecords: hearingRecords.map(hr => ({
                date: new Date(hr.hearingDate).toLocaleDateString(),
                record: hr.recordText,
                recordedBy: hr.recordedBy?.username || "Unknown"
            })),
            documents: documents.map(d => ({
                title: d.title,
                uploadedAt: new Date(d.createdAt).toLocaleDateString()
            })),
            auditHistory: logs.map(l => ({
                action: l.action,
                details: l.details,
                date: new Date(l.createdAt).toLocaleDateString()
            }))
        };

        // 3. Define the system prompt with strict rules
        const prompt = `You are an AI legal case assistant inside a Court Case Management System.

Answer the user's question using only the provided case data.

Rules:
1. Do not create fake facts.
2. If information is not available in the provided data, say: "This information is not available in the case records."
3. Do not provide final legal judgment.
4. Do not give legal advice.
5. Explain in clear, professional, simple language.
6. Keep the answer relevant to the selected case only.
7. If the question is outside the selected case, politely refuse.

Case Data:
${JSON.stringify(caseData, null, 2)}

User Question:
${question}
`;

        // 4. Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in caseChatbotService:", error);
        throw error;
    }
};
