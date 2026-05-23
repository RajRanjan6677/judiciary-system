import mongoose from "mongoose";

const hearingSchema=new mongoose.Schema({
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Case",
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    remarks:{
        type:String,
        required:true,
    },
    nextHearingDate:{
        type:Date,
    },
    reminderSent:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

export default mongoose.model("Hearing",hearingSchema)