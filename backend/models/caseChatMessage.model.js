import mongoose from "mongoose";

const caseChatMessageSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export default mongoose.model("CaseChatMessage", caseChatMessageSchema);
