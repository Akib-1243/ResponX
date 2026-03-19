import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        required:true,
        unique: true,
    },

    password: {
        type: String,
        required:true,
        
    },

    role: {
        type: String,
        enum: ['victim', 'volunteer', 'trusted_volunteer', 'admin'],
        default: 'victim'
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    // Optional fields used by the forgot-password flow
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined,
    },

    // Optional fields used by Google OAuth
    googleId: {
        type: String,
        default: undefined,
        sparse: true,
        unique: true,
    },

    // Optional fields used by Facebook OAuth
    facebookId: {
        type: String,
        default: undefined,
        sparse: true,
        unique: true,
    },

    // Optional fields used by GitHub OAuth
    githubId: {
        type: String,
        default: undefined,
        sparse: true,
        unique: true,
    },

    // Optional fields used by LinkedIn OAuth
    linkedinId: {
        type: String,
        default: undefined,
        sparse: true,
        unique: true,
    },

}, {timestamps: true});

userSchema.pre("save", async function(){
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);

};

const User =mongoose.model("User", userSchema);

export default User;