import mongoose, { Schema, model, models } from "mongoose";

const StopSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    location: {
        type: [Number],
        required: [true, 'Location coordinates are required']
    },
    locationName: {
        type: String,
    },
    startDate: {
        type: String,
    },
    notes: {
        type: String,
    },
    desc: {
        type: String,
    },
});

const Stop = models.Stop || model("Stop", StopSchema);

export default Stop;
