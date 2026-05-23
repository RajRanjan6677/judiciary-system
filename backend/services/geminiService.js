import { GoogleGenerativeAI } from "@google/generative-ai";
import Case from "../models/case.model.js";
import Hearing from "../models/hearing.model.js";
import HearingRecord from "../models/hearingRecord.model.js";
import Document from "../models/document.model.js";
import Log from "../models/log.model.js";

/**
 * Generates an AI case summary using Gemini.
 * @param {string} caseId - The ID of the case
 * @returns {Promise<string>} The generated summary in markdown
 */
export const generateCaseSummary = async (caseId) => {
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
            status: caseDetails.status,
            assignedJudge: caseDetails.judgeId ? caseDetails.judgeId.username : "Unassigned",
            assignedLawyer: caseDetails.lawyerId ? caseDetails.lawyerId.username : "Unassigned",
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

        // 3. Define the prompt
        const prompt = `You are a legal case assistant. Summarize the following court case information in a clear, neutral, and professional way.
        
Do not create fake facts. Only use the provided data.

Return the summary strictly in this markdown structure:

### 1. Case Overview
### 2. Parties and Assigned Officials
### 3. Hearing History
### 4. Important Hearing Records
### 5. Current Status
### 6. Key Observations
### 7. Suggested Next Steps

Case Data:
${JSON.stringify(caseData, null, 2)}`;

        // 4. Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in geminiService:", error);
        throw error;
    }
};
