import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import HearingRecord from "../models/hearingRecord.model.js";
import Case from "../models/case.model.js";
import Hearing from "../models/hearing.model.js";
import Log from "../models/log.model.js";

const route = express.Router();

// Helper to check case ownership
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

// POST / - Create a hearing record
route.post("/", protect, authorize("admin", "clerk"), async (req, res) => {
    try {
        const { caseId, hearingId, recordText } = req.body;

        if (!caseId || !hearingId || !recordText) {
            return res.status(400).json({ message: "caseId, hearingId, and recordText are required" });
        }

        const caseCheck = await checkCaseAccess(req, res, caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        const hearing = await Hearing.findById(hearingId);
        if (!hearing) return res.status(404).json({ message: "Hearing not found" });

        // Ensure only one record per hearing
        const existingRecord = await HearingRecord.findOne({ hearingId });
        if (existingRecord) {
            return res.status(400).json({ message: "A record for this hearing already exists" });
        }

        const newRecord = await HearingRecord.create({
            caseId,
            hearingId,
            hearingDate: hearing.date,
            recordText,
            recordedBy: req.user.id
        });

        // Audit Log
        await Log.create({
            action: "Added Hearing Record",
            details: `Hearing record added for hearing on ${new Date(hearing.date).toLocaleDateString()}`,
            caseId,
            performedBy: req.user.id
        });

        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Error creating hearing record:", error);
        res.status(500).json({ message: "Failed to create hearing record", error: error.message });
    }
});

// GET /:caseId - Get all hearing records for a case
route.get("/:caseId", protect, authorize("admin", "clerk", "lawyer", "judge"), async (req, res) => {
    try {
        const caseCheck = await checkCaseAccess(req, res, req.params.caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        const records = await HearingRecord.find({ caseId: req.params.caseId })
            .populate("recordedBy", "username role")
            .populate("updatedBy", "username role")
            .sort({ hearingDate: -1 });

        res.json(records);
    } catch (error) {
        console.error("Error fetching hearing records:", error);
        res.status(500).json({ message: "Failed to fetch hearing records" });
    }
});

// GET /single/:hearingId - Get specific record by hearing ID
route.get("/single/:hearingId", protect, authorize("admin", "clerk", "lawyer", "judge"), async (req, res) => {
    try {
        const record = await HearingRecord.findOne({ hearingId: req.params.hearingId }).populate("recordedBy", "username role");
        if (!record) return res.status(404).json({ message: "Record not found" });

        const caseCheck = await checkCaseAccess(req, res, record.caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch hearing record" });
    }
});

// PUT /:id - Update hearing record
route.put("/:id", protect, authorize("admin", "clerk"), async (req, res) => {
    try {
        const record = await HearingRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        const caseCheck = await checkCaseAccess(req, res, record.caseId);
        if (caseCheck.error) return res.status(caseCheck.status).json({ message: caseCheck.message });

        record.recordText = req.body.recordText || record.recordText;
        record.updatedBy = req.user.id;
        await record.save();

        // Audit Log
        await Log.create({
            action: "Updated Hearing Record",
            details: `Hearing record updated for hearing on ${new Date(record.hearingDate).toLocaleDateString()}`,
            caseId: record.caseId,
            performedBy: req.user.id
        });

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: "Failed to update record" });
    }
});

// DELETE /:id - Delete hearing record
route.delete("/:id", protect, authorize("admin"), async (req, res) => {
    try {
        const record = await HearingRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        // Audit Log
        await Log.create({
            action: "Deleted Hearing Record",
            details: `Hearing record deleted for hearing on ${new Date(record.hearingDate).toLocaleDateString()}`,
            caseId: record.caseId,
            performedBy: req.user.id
        });

        res.json({ message: "Record deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete record" });
    }
});

export default route;
