import mongoose from "mongoose";

const hearingRecordSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
    },
    hearingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hearing",
        required: true,
    },
    hearingDate: {
        type: Date,
        required: true,
    },
    recordText: {
        type: String,
        required: true,
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

export default mongoose.model("HearingRecord", hearingRecordSchema);
