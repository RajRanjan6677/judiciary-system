import express from "express";
import Log from "../models/log.model.js";
import Case from "../models/case.model.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
const route = express.Router();

route.get("/", protect, authorize("admin", "judge"), async (req, res) => {
    try {
        let query = {};
        
        // If the user is a Judge, strictly filter logs to only their assigned cases
        if (req.user.role === "judge") {
            const myCases = await Case.find({ judgeId: req.user.id }).select("_id");
            query.caseId = { $in: myCases.map(c => c._id) };
        }
        // If the user is an Admin, the query remains {} so they fetch EVERYTHING.

        const logs = await Log.find(query)
            .populate("caseId", "caseNumber title")
            .populate("performedBy", "username role")
            .sort({ createdAt: -1 }); // Newest logs first
            
        res.json(logs);
    } catch (error) {
        console.log("Error fetching logs:", error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
});

export default route;