import { protect } from "../middlewares/auth.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"
import Case from "../models/case.model.js"
import express from "express"
import User from "../models/user.model.js"
import Hearing from "../models/hearing.model.js"
import Log from "../models/log.model.js";
const route=express.Router()

// route.get("/",protect,authorize("lawyer","admin","clerk","judge"),async (req,res)=>{
//     try{const query={}
//     if(req.user.role==="lawyer")
//         query.lawyerId=req.user.id

//     const cases=await Case.find(query).populate("lawyerId","username email").populate("createdBy","username role").sort({createdAt:-1})
//     res.json(cases)}
//     catch(error){
//         console.log('error during fetching',error)
//         res.status(500).json({ message: "Failed to fetch cases" })
//     }
// })

// route.get("/", protect, authorize("lawyer", "admin", "clerk", "judge"), async (req, res) => {
//     try {
//         const query = {};
        
//         // Filter for Lawyer
//         if(req.user.role === "lawyer") {
//             query.lawyerId = req.user.id;
//         }
//         // Filter for Judge
//         if(req.user.role === "judge") {
//             query.judgeId = req.user.id; 
//         }

//         const cases = await Case.find(query)
//             .populate("lawyerId", "username email")
//             .populate("judgeId", "username email") // <-- Add this!
//             .populate("createdBy", "username role")
//             .sort({createdAt: -1});
            
//         res.json(cases);
//     } catch(error) {
//         console.log('error during fetching', error);
//         res.status(500).json({ message: "Failed to fetch cases" });
//     }
// });
route.get("/", protect, authorize("lawyer", "admin", "clerk", "judge"), async (req, res) => {
    try {
        const query = {};
        
        // 1. Role-Based Security Filters
        if(req.user.role === "lawyer") query.lawyerId = req.user.id;
        if(req.user.role === "judge") query.judgeId = req.user.id; 

        // 2. Status Filter (from frontend)
        if (req.query.status) {
            query.status = req.query.status;
        }

        // 3. Search Bar Filter (Search by Title or Case Number)
        if (req.query.search) {
            const searchTerm = req.query.search;
            const searchNum = parseInt(searchTerm);

            if (!isNaN(searchNum)) {
                // If they typed a number, search both Title and Case Number
                query.$or = [
                    { title: { $regex: searchTerm, $options: "i" } }, // 'i' makes it case-insensitive
                    { caseNumber: searchNum }
                ];
            } else {
                // If they typed text, just search the Title
                query.title = { $regex: searchTerm, $options: "i" };
            }
        }

        const cases = await Case.find(query)
            .populate("lawyerId", "username email")
            .populate("judgeId", "username email")
            .populate("createdBy", "username role")
            .sort({createdAt: -1});
            
        res.json(cases);
    } catch(error) {
        console.log('error during fetching', error);
        res.status(500).json({ message: "Failed to fetch cases" });
    }
});
route.get("/:id", protect, authorize("lawyer", "admin", "clerk","judge"), async (req, res) => {
    try {
        // Added .populate() so the frontend gets the actual names, just like your GET / route
        const courtCase = await Case.findById(req.params.id)
            .populate("lawyerId", "username email")
            .populate("createdBy", "username role");

        if(!courtCase)
            return res.status(404).json({message: "case not found"});
            
        // FIX: Safely check if lawyerId exists before checking it, to prevent server crash
        if (req.user.role === "lawyer") {
            const isAssignedLawyer = courtCase.lawyerId && courtCase.lawyerId._id.toString() === req.user.id;
            if (!isAssignedLawyer) {
                return res.status(403).json({message: "unauthorized: you are not assigned to this case"});
            }
        }
        
        res.json(courtCase);
    } catch (error) {
        console.log("error during getting case by id", error);
        res.status(400).json({message: "invalid case id"});
    }
});

route.post("/", protect, authorize("admin", "clerk"), async function(req, res){
    try{
        
const { caseNumber, title, description, lawyerId, judgeId } = req.body;

if (!caseNumber || !title || !description) {
    return res.status(400).json({ message: "Case number, title, and description are required" });
}

// ... existing unique case check ...
const unique = await Case.findOne({ caseNumber });
        if(unique) {
            return res.status(400).json({
                message: "Case no already exist",
            });
        }
        // 2. Only check for the lawyer IF a lawyerId was actually passed
        if (lawyerId) {
            // Note: I changed findById to findOne here too, just like in the update route!
            const lawyer = await User.findOne({ _id: lawyerId, role: "lawyer" });
            if(!lawyer) {
                return res.status(400).json({ message: "invalid lawyer" });
            }
        }
// Optional: Validate judgeId just like you validated lawyerId
if (judgeId) {
    const judge = await User.findOne({ _id: judgeId, role: "judge" });
    if(!judge) {
        return res.status(400).json({ message: "invalid judge" });
    }
}

const newCase = await Case.create({
    caseNumber,
    title,
    description,
    lawyerId: lawyerId || null,
    judgeId: judgeId || null, // <-- Save the judgeId
    createdBy: req.user.id
});
        // NEW: Log the case creation
        await Log.create({
            action: "Created New Case",
            details: `Case #${caseNumber}: ${title} registered in the system`,
            caseId: newCase._id,
            performedBy: req.user.id
        });
        res.status(201).json(newCase);
    }catch(error){
        console.log("error during court case creation", error);
        res.status(500).json({
            message: "Case creation failed",
            error: error.message,
        });
    }
});

route.put("/:id", protect, authorize("admin", "clerk", "lawyer","judge"), async (req, res) => {
    try {
        // 1. Fetch the case first to check permissions
        const existingCase = await Case.findById(req.params.id);
        if(!existingCase)
            return res.status(404).json({message: 'case not found'});

        // 2. If user is a lawyer, ensure they own the case
        if (req.user.role === "lawyer") {
            const isAssignedLawyer = existingCase.lawyerId && existingCase.lawyerId.toString() === req.user.id;
            if (!isAssignedLawyer) {
                return res.status(403).json({ message: "unauthorized: you can only update your own cases" });
            }
        }

        // 3. Define what can be updated based on role
        // Lawyers shouldn't be able to reassign the case to another lawyer or change the title
        // let allowedUpdates = ["description", "status"]; 
        // if (req.user.role === "admin" || req.user.role === "clerk") {
        //     allowedUpdates = ["title", "description", "status", "lawyerId"];
        // }
        // Inside route.put("/:id", ...)
// Define what can be updated based on role
let allowedUpdates = ["description", "status", "summary"]; // Lawyers and Judges
if (req.user.role === "admin" || req.user.role === "clerk") {
    // Admins and Clerks can also change the assigned lawyer and judge
    allowedUpdates = ["title", "description", "status", "lawyerId", "judgeId", "summary"]; 
}
// ... the rest of your update logic stays the same

        const update = {};
        for(const field of allowedUpdates) {
            if(req.body[field] !== undefined)
                update[field] = req.body[field];
        }

        // 4. Validate new lawyerId if an admin/clerk is trying to assign one
        if(update.lawyerId) {
            const lawyer = await User.findOne({_id: update.lawyerId, role: "lawyer"});
            if(!lawyer)
                return res.status(400).json({message: "invalid lawyer id"});
        }

        const updated = await Case.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
            .populate("lawyerId", "username email"); // populate returned data
        // ... your existing code that updates the case ...

        // NEW: Create an Audit Log
        await Log.create({
            action: "Updated Case Details",
            details: `Updated status to ${req.body.status}`,
            caseId: req.params.id,
            performedBy: req.user.id
        });

        // res.json({ message: "case updated successfully" }); // your existing response
        res.json(updated);
        
    } catch (error) {
        console.log("error during case update", error);
        res.status(400).json({
            message: "Update failed",
            error: error.message,
        });
    }
});
route.delete("/:id",protect,authorize("admin"),async (req,res)=>{
    try{const deleted=await Case.findByIdAndDelete(req.params.id)
    if(!deleted)
        return res.status(404).json({message:'case not found'})
    res.json({message:"case deleted"})}
    catch(error){
        console.log("error during case delete",error)
        res.status(400).json({ message: "Delete failed" });
    }
})
export default route