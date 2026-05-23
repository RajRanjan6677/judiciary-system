// import mongoose from "mongoose";
// import bcrypt from "bcryptjs"
// const userSchema=new mongoose.Schema({
//     username:{
//         type:String,
//         required:true,
//     },
//     email:{
//         type:String,
//         required:true,
//         unique:true,
//     },
//     password:{
//         type:String,
//         required:true,
//         minlength:6
//     },
//     role:{
//         type:String,
//         enum:["admin","lawyer","clerk","judge"],
//         default:"clerk"
//     }
// })
// userSchema.pre("save",async function(next){
//     if(!this.isModified("password"))
//         return;
//     try{
//         this.password=await bcrypt.hash(this.password,10)
//         next()
//     }
//     catch(error){
//         console.log("error during hashing")
//     }
// })
// export default mongoose.model("User",userSchema)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["admin", "lawyer", "clerk", "judge"],
        default: "clerk"
    }
});

// FIX 1: Removed 'next' from the parentheses
userSchema.pre("save", async function() {
    
    // FIX 2: Since it's an async function, simply returning tells Mongoose to move on!
    if (!this.isModified("password")) {
        return; 
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // We don't need next() here anymore. Mongoose automatically finishes up.
    } catch (error) {
        console.log("Error during hashing:", error.message);
        
        // FIX 3: By 'throwing' the error, Mongoose automatically aborts the save 
        // and sends the error back to your frontend!
        throw error; 
    }
});

export default mongoose.model("User", userSchema);