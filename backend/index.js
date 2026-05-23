import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import userRoute from "./routes/user.route.js";
import { protect } from "./middlewares/auth.middleware.js";
import { authorize } from "./middlewares/authorize.middleware.js";
import caseRoute from "./routes/case.route.js"
import hearingRoute from "./routes/hearing.route.js"
import cookieParser from "cookie-parser";
import documentRoute from "./routes/document.route.js"
import logReport from "./routes/log.route.js"
import path from "path"
import { startHearingReminderCron } from "./cron/hearingReminderCron.js"

dotenv.config()
const app=express()
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
connectDB()
app.use(cookieParser())
app.use("/api/auth",userRoute)
app.use("/api/cases",caseRoute)
app.use("/api/hearing",hearingRoute)
app.use("/api/documents",documentRoute)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use("/api/logs",logReport)
app.get("/",(req,res)=>{
    res.send("api running")
})
app.get("/cases",protect,authorize("admin","clerk"),(req,res)=>{
    res.status(201).json({message:"case created"})
})

// Initialize Cron Jobs
startHearingReminderCron();

app.listen(3000,()=>{
    console.log("server running on port 3000")
})