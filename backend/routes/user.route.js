import User from "../models/user.model.js"
import express from "express"
import jwt from "jsonwebtoken"
import { protect } from "../middlewares/auth.middleware.js"
import {authorize} from "../middlewares/authorize.middleware.js"
import bcrypt from "bcryptjs"
const route=express.Router()

route.post("/register",async function(req,res){
    try{const {username,email,password,role}=req.body
    const emailAlreadyExists=await User.findOne({email})
    if(emailAlreadyExists)
        return res.status(400).json({message:"email already exist"})
    const user=await User.create({username,email,password,role})
    //TODO expires in 
    const token=await jwt.sign({_id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET)
    // todo in cookie ->{
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 24 * 60 * 60 * 1000,
    // }
    res.cookie("jwt",token)

    res.status(201).json({message:"user registered successfully",
        user:{
            id:user._id,
            email:user.email,
            role:user.role
        }
    })}
    catch(error){
        res.status(500).json({
      message: "Registration failed",
      error: error.message,
    })
        console.log("Error dusing registration",error)
    }
})

route.post("/login",async function(req,res){
    try{const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user)
        return res.json({message:"please register"})
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
        return res.json({message:"wrong password"})
    const token = await jwt.sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET)
    res.cookie("jwt",token)

    res.status(201).json({message:"login successful",
        user:{
            id:user._id,
            email:user.email,
            role:user.role
        }
    })}
    catch(error){
        console.log("Error during login",error)
        res.status(500).json({
      message: "login failed",
      error: error.message,
    })
    }
})
route.get("/check",protect,(req,res)=>{
    return res.json({role:req.user.role})
})

route.post("/logout", (req, res) => {
    try {
        // Replace "token" with whatever name you gave your cookie when logging in
        res.cookie("jwt", "");

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error during logout", error);
        res.status(500).json({ message: "Logout failed" });
    }
});

// --- USER MANAGEMENT ROUTES (For Frontend Views) ---

// 1. Get ALL Lawyers (For dropdowns and Clerk's 'All Lawyers' view)
route.get("/lawyers", protect, authorize("admin", "clerk"), async (req, res) => {
    try {
        const lawyers = await User.find({ role: "lawyer" }).select("-password");
        res.status(200).json(lawyers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lawyers", error: error.message });
    }
});
// GET route to fetch all judges
route.get("/judges", protect, authorize("admin", "clerk"), async (req, res) => {
    try {
        const judges = await User.find({ role: "judge" }).select("-password");
        res.status(200).json(judges);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch judges" });
    }
});
// 2. Get ALL Users (For Admin's 'All Users' view)
route.get("/", protect, authorize("admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
});

// 3. Explicit Add Lawyer Route (For Admin/Clerk)
// route.post("/addLawyer", protect, authorize("admin", "clerk"), async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         if (!username || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const emailAlreadyExists = await User.findOne({ email });
//         if(emailAlreadyExists) {
//             return res.status(400).json({ message: "Lawyer with this email already exists" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newLawyer = await User.create({
//             username,
//             email,
//             password: hashedPassword,
//             role: "lawyer" // Force role to lawyer
//         });

//         res.status(201).json({
//             message: "Lawyer created successfully",
//             lawyer: { id: newLawyer._id, username: newLawyer.username, email: newLawyer.email }
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Lawyer creation failed", error: error.message });
//     }
// });
// 3. General Add User Route (For Admin/Clerk)
route.post("/addUser", protect, authorize("admin", "clerk"), async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Security Check: Prevent clerks from creating admins
        if (req.user.role === "clerk" && role === "admin") {
            return res.status(403).json({ message: "Unauthorized: Clerks cannot create Admin accounts" });
        }

        const emailAlreadyExists = await User.findOne({ email });
        if(emailAlreadyExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: password,
            role // Now taking the role directly from the request body
        });

        res.status(201).json({
            message: "User created successfully",
            user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ message: "User creation failed", error: error.message });
    }
});

// In your auth/user route file
route.delete("/:id", protect, authorize("admin"), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log("Error deleting user", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});
export default route