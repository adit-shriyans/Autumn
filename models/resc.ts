import mongoose, { Schema, model, models } from "mongoose";

const TripSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dept: {
        type: String,
        required: [true, "Dept. not set"]
    },
    location: {
        type: [Number],
    },
    locationName: {
        type: String,
    },
    no: {
        type: String,
    },
    email: {
        type: String,
    }
})

const Trip = models.Trip || model("Trip", TripSchema);

export default Trip;