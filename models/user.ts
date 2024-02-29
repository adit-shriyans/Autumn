import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    email:{
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required'],
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
    },
    image: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7tyEA8rRXZabfLf_AwxDy-vQ91ecjMJjxVw&usqp=CAU"
    }
})

const User = models.User || model("User", UserSchema);

export default User;