import Case from "../models/case.model.js";
import Hearing from "../models/hearing.model.js";
import HearingRecord from "../models/hearingRecord.model.js";
import Document from "../models/document.model.js";
import Log from "../models/log.model.js";
import CaseAISummary from "../models/caseAISummary.model.js";

/**
 * Collects safe case-related information for AI analysis
 * @param {string} caseId - The ID of the case
 * @returns {Promise<Object>} Collected case data object
 */
export const collectCaseDataForAI = async (caseId) => {
    try {
        const caseDetails = await Case.findById(caseId)
            .populate('judgeId', 'username email')
            .populate('lawyerId', 'username email');
        
        if (!caseDetails) throw new Error("Case not found");

        const hearings = await Hearing.find({ caseId }).sort({ date: 1 });
        const hearingRecords = await HearingRecord.find({ caseId }).sort({ hearingDate: 1 }).populate('recordedBy', 'username role');
        const documents = await Document.find({ caseId }).sort({ createdAt: 1 });
        const logs = await Log.find({ caseId }).sort({ createdAt: 1 }).populate('performedBy', 'username role');
        const aiSummary = await CaseAISummary.findOne({ caseId }).sort({ createdAt: -1 });

        // Currently CaseParty model is not fully implemented in previous context, handling gracefully
        // Assuming we just collect basic case details as available
        
        const caseData = {
            caseNumber: caseDetails.caseNumber,
            title: caseDetails.title,
            description: caseDetails.description,
            category: caseDetails.caseCategory,
            status: caseDetails.status,
            assignedJudge: caseDetails.judgeId ? { name: caseDetails.judgeId.username, email: caseDetails.judgeId.email } : "Unassigned",
            assignedLawyer: caseDetails.lawyerId ? { name: caseDetails.lawyerId.username, email: caseDetails.lawyerId.email } : "Unassigned",
            hearings: hearings.map(h => ({ date: h.date, remarks: h.remarks })),
            hearingRecords: hearingRecords.map(hr => ({ date: hr.hearingDate, record: hr.recordText, writtenBy: hr.recordedBy?.username })),
            documents: documents.map(d => ({ title: d.title, metadata: d.createdAt })),
            aiCaseSummary: aiSummary ? aiSummary.summary : "Not available",
            auditLogActivityHistory: logs.map(l => ({ action: l.action, details: l.details, date: l.createdAt }))
        };

        return caseData;
    } catch (error) {
        console.error("Error collecting case data:", error);
        throw error;
    }
};
