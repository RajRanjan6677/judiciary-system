// import mongoose, { Types } from "mongoose";

// const caseSchema=new mongoose.Schema({
//     caseNumber:{
//         type:Number,
//         required:true,
//         unique:true
//     },
//     title:{
//         type:String,
//         required:true,
//     },
//     description:{
//         type:String,
//         required:true
//     },
//     status:{
//         type:String,
//         enum:["open","closed","pending"],
//         required:true,
//         default:"pending"
//     },
//     lawyerId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User",
//         // required:true
//     },
//     judgeName:{
//         type:String,
//         // required:true
//     },
//     createdBy:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User",
//         required:true
//     }
// },{timestamps:true})

// export default mongoose.model("Case",caseSchema)
import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
    caseNumber: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["open", "closed", "pending"],
        required: true,
        default: "pending"
    },
    summary: {
        type: String,
        default: ""
    },
    caseCategory: {
        type: String,
        enum: ["UAPA", "Rape", "POCSO", "Murder", "Civil", "Property", "Family", "Criminal", "Other"],
        default: "Other"
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // optional
    },
    // CHANGED: Replaced judgeName with judgeId referencing the User model
    judgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // optional (can be assigned later by admin/clerk)
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Case", caseSchema);