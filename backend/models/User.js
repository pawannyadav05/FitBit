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
        required: function() { return this.role === 'user'; }
    },
    startWeight: {
        type: Number,
        default: null
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
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
    streak: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: Date,
        default: null
    },
    dietPlan: {
        type: String,
        default: null
    },
    workoutPlan: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["user", "trainer", "admin"],
        default: "user"
    }
    
});
export default mongoose.model("User", userSchema);
