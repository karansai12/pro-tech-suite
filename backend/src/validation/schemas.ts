import z from "zod";


export const RegisterSchema  = z.object({
    username:z.string("Username is required").max(50,"Username must be at most 50 characters"),
    mobileNumber:z.string("Mobile number is required").min(10, "Mobile number must be at least 10 digits").max(15,"Mobile cat not be more than 15 digits"),
    profileImage:z.string("Profile image URL is required"),
    email:z.email({error:"Invalid email address"}),
    password:z.string("Password is required").min(8, "Password must be at least 8 characters").max(30,"Password must be at most 30 character"),
    role:z.enum(["manager","employee"],{
        error:"Role must be 'manager' or 'employee'"
    })
})