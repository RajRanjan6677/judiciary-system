import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"
import Case from "../models/case.model.js"
import Hearing from "../models/hearing.model.js"
import User from "../models/user.model.js"
import { sendHearingCreationEmail } from "../services/emailService.js"
const route=express.Router()

route.get("/today", protect, authorize("admin", "clerk", "lawyer", "judge"), async (req, res) => {
    try {
        let query = {};
        
        // Date filtering for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        query.date = { $gte: startOfDay, $lte: endOfDay };

        // 1. If Lawyer, only find cases where lawyerId matches
        if (req.user.role === "lawyer") {
            const myCases = await Case.find({ lawyerId: req.user.id }).select('_id');
            query.caseId = { $in: myCases.map(c => c._id) };
        }
        // 2. If Judge, only find cases where judgeId matches
        else if (req.user.role === "judge") {
            const myCases = await Case.find({ judgeId: req.user.id }).select('_id');
            query.caseId = { $in: myCases.map(c => c._id) };
        }

        const hearings = await Hearing.find(query)
            .populate("caseId", "caseNumber title status") 
            .sort({ date: 1 });

        res.json(hearings);
    } catch (error) {
        console.log("error fetching today's hearings", error);
        res.status(500).json({ message: "Failed to fetch today's hearings" });
    }
});

// route.get("/:caseId",protect,authorize("admin","clerk","lawyer","judge"),async function(req,res){
//     try {
//         const caseExist=await Case.findById({_id:req.params.caseId})
//         if(!caseExist)
//             return res.status(404).json({message:"case not found"})
//         // if(req.user.role==="lawyer"&&req.user.id!==caseExist.lawyerId.toString())
//         //     return res.status(403).json({message:"unauthorized"})
//         if (req.user.role === "lawyer") {
//     const isAssigned = caseExist.lawyerId && caseExist.lawyerId.toString() === req.user.id;
//     if (!isAssigned) {
//         return res.status(403).json({ message: "unauthorized" });
//     }
// }
//         const hearings=await Hearing.find({caseId:req.params.caseId}).populate("createdBy","username role").sort({date:1})
//         res.json(hearings)
//     } catch (error) {
//         console.log("error in getting case hearing",error)
//         res.status(500).json({
//       message: "get hearing failed",
//       error: error.message,
//     });
//     }
// })
route.get("/:caseId", protect, authorize("admin", "clerk", "lawyer", "judge"), async function(req, res){
    try {
        const caseExist = await Case.findById(req.params.caseId);
        if(!caseExist)
            return res.status(404).json({message: "case not found"});
            
        // 1. Lawyer Security Check
        if (req.user.role === "lawyer") {
            const isAssigned = caseExist.lawyerId && caseExist.lawyerId.toString() === req.user.id;
            if (!isAssigned) {
                return res.status(403).json({message: "unauthorized: not your case"});
            }
        }

        // 2. Judge Security Check
        if (req.user.role === "judge") {
            const isAssigned = caseExist.judgeId && caseExist.judgeId.toString() === req.user.id;
            if (!isAssigned) {
                return res.status(403).json({message: "unauthorized: not your assigned case"});
            }
        }

        const hearings = await Hearing.find({caseId: req.params.caseId})
            .populate("createdBy", "username role")
            .sort({date: 1});
            
        res.json(hearings);
    } catch (error) {
        console.log("error in getting case hearing", error);
        res.status(500).json({ message: "get hearing failed" });
    }
});
route.post("/",protect,authorize("admin","clerk","judge"),async function(req,res){
    try {
        const {caseId,date,remarks,nextHearingDate}=req.body
        if(!caseId||!date||!remarks)
            return res.status(400).json({message:"all fiels are required"})
        const caseExist=await Case.findById(caseId)
        if(!caseExist)
            return res.status(404).json({message:"case not found"})
        const hearing={
            caseId,
            date,
            remarks,
            createdBy:req.user.id
        }
        if(nextHearingDate)
            hearing.nextHearingDate=nextHearingDate
        const createdHearing=await Hearing.create(hearing)
        
        // --- EMAIL NOTIFICATION LOGIC ---
        // If sendNotification flag is passed, trigger async email
        if (req.body.sendNotification) {
            // Retrieve lawyer and judge emails
            let lawyer = null;
            let judge = null;
            if (caseExist.lawyerId) {
                lawyer = await User.findById(caseExist.lawyerId).select('email username');
            }
            if (caseExist.judgeId) {
                judge = await User.findById(caseExist.judgeId).select('email username');
            }
            
            // Asynchronously send the email (don't await so API doesn't block)
            sendHearingCreationEmail(createdHearing, caseExist, lawyer, judge);
        }
        
        res.status(201).json(createdHearing)
    } catch (error) {
        console.log("error in creating case hearing",error)
        res.status(500).json({
      message: "create hearing failed",
      error: error.message,
    });
    }
})

// GET / - Get all hearings (filtered by role) sorted by date
// route.get("/", protect, authorize("admin", "clerk", "lawyer","judge"), async (req, res) => {
//     try {
//         let query = {};

//         // If the user is a lawyer, restrict to only their assigned cases
//         if (req.user.role === "lawyer") {
//             const myCases = await Case.find({ lawyerId: req.user.id }).select('_id');
//             const myCaseIds = myCases.map(c => c._id);
            
//             // Query only hearings where the caseId is in the lawyer's case list
//             query.caseId = { $in: myCaseIds };
//         }

//         // Fetch hearings, populate the Case details, and sort by date ascending (upcoming first)
//         // const hearings = await Hearing.find(query)
//         //     .populate("caseId", "caseNumber title status") 
//         //     .sort({ date: 1 });
//         // Change this line in your GET / route in hearing.route.js:
// const hearings = await Hearing.find(query)
//     .populate({
//         path: "caseId",
//         select: "caseNumber title status judgeId", // <-- Add judgeId here
//         populate: { path: "judgeId", select: "username" } // <-- Nested populate to get the name
//     })
//     .sort({ date: 1 });
//         res.json(hearings);
//     } catch (error) {
//         console.log("error fetching all hearings", error);
//         res.status(500).json({
//             message: "Failed to fetch hearing schedule",
//             error: error.message,
//         });
//     }
// });
route.get("/", protect, authorize("admin", "clerk", "lawyer", "judge"), async (req, res) => {
    try {
        let query = {};

        // 1. If Lawyer, only find cases where lawyerId matches
        if (req.user.role === "lawyer") {
            const myCases = await Case.find({ lawyerId: req.user.id }).select('_id');
            query.caseId = { $in: myCases.map(c => c._id) };
        }
        
        // 2. If Judge, only find cases where judgeId matches
        else if (req.user.role === "judge") {
            const myCases = await Case.find({ judgeId: req.user.id }).select('_id');
            query.caseId = { $in: myCases.map(c => c._id) };
        }
        // Admins and Clerks bypass these if-statements, so their query remains {} (fetching everything)

        const hearings = await Hearing.find(query)
            .populate("caseId", "caseNumber title status") 
            .sort({ date: 1 });

        res.json(hearings);
    } catch (error) {
        console.log("error fetching all hearings", error);
        res.status(500).json({ message: "Failed to fetch hearing schedule" });
    }
});
export default route