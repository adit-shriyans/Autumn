import { Schema, model, models } from "mongoose";

const StopSchema = new Schema({
    trip: {
        type: Schema.Types.ObjectId,
        ref: "Trip",
    },
    id: {
        type: Number,
        required: [true, 'Stop Id is required'],
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
    endDate: {
        type: String,
    },
    notes: {
        type: String,
    },
});

const Stop = models.Stop || model("Stop", StopSchema);

export default Stop;
