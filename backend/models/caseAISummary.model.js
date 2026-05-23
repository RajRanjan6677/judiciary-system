import mongoose from "mongoose";

const caseAISummarySchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    generatedForRole: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model("CaseAISummary", caseAISummarySchema);
