import mongoose from 'mongoose'
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required : true
    },
    email:{
        type:String,
        required:true,
        unique : true
    },
    password:{
        type:String,
        required:true,
    },
    height: {
        type: Number
    },
    weight: {
        type: Number,
        required: true
    },
    goalWeight: {
        type: Number
    },
    pendingRequest: {
        weight: {
            type: Number,
            default: null
        }
    },
    role: {
        type: String,
        enum: ["user", "trainer", "admin"],
        default: "user"
    }
    
});
export default mongoose.model("User", userSchema);
