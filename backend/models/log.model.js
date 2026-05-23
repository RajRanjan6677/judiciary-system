import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    action: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String 
    },
    caseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Case",
        required: true 
    },
    performedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model("Log", logSchema);