import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import Case from "../models/case.model.js";
import Document from "../models/document.model.js";
import Log from "../models/log.model.js";
const route = express.Router();

// --- MULTER CONFIGURATION ---
// Set up where and how the files should be saved
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure you create an "uploads" folder in your backend root!
    },
    filename: function (req, file, cb) {
        // Create a unique filename using the current timestamp
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });


// --- ROUTES ---

// POST /:caseId - Upload a new document
// upload.single("file") expects the frontend to send the file in a field named "file"
route.post("/:caseId", protect, authorize("admin", "clerk", "lawyer","judge"), upload.single("file"), async (req, res) => {
    try {
        const { title } = req.body;
        const caseId = req.params.caseId;

        if (!req.file) return res.status(400).json({ message: "Please upload a file" });
        if (!title) return res.status(400).json({ message: "Document title is required" });

        // 1. Check if case exists and verify lawyer permissions
        const caseExist = await Case.findById(caseId);
        if (!caseExist) return res.status(404).json({ message: "Case not found" });

        if (req.user.role === "lawyer") {
            const isAssigned = caseExist.lawyerId && caseExist.lawyerId.toString() === req.user.id;
            if (!isAssigned) {
                return res.status(403).json({ message: "Unauthorized: You can only upload to your assigned cases" });
            }
        }

        // 2. Save document record to database
        const newDocument = await Document.create({
            caseId,
            title,
            fileUrl: `/uploads/${req.file.filename}`, // The path we will use to access the file later
            uploadedBy: req.user.id
        });
        // Inside your document POST route...

        // --- NEW: Create the Audit Log for the Document Upload ---
        await Log.create({
            action: "Uploaded Document",
            details: `File attached: ${req.body.title}`, // Records the title they typed
            caseId: req.params.caseId,
            performedBy: req.user.id
        });

        //res.status(201).json(newDocument); // Your existing response
        res.status(201).json(newDocument);
    } catch (error) {
        console.log("Error uploading document", error);
        res.status(500).json({ message: "Document upload failed", error: error.message });
    }
});

// GET /:caseId - Get all documents for a specific case
route.get("/:caseId", protect, authorize("admin", "clerk", "lawyer","judge"), async (req, res) => {
    try {
        const caseExist = await Case.findById(req.params.caseId);
        if (!caseExist) return res.status(404).json({ message: "Case not found" });

        // Lawyer security check
        if (req.user.role === "lawyer") {
            const isAssigned = caseExist.lawyerId && caseExist.lawyerId.toString() === req.user.id;
            if (!isAssigned) {
                return res.status(403).json({ message: "Unauthorized" });
            }
        }

        const documents = await Document.find({ caseId: req.params.caseId })
            .populate("uploadedBy", "username role")
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (error) {
        console.log("Error fetching documents", error);
        res.status(500).json({ message: "Failed to fetch documents", error: error.message });
    }
});

export default route;