import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
import { MarkerLocation, StatusType } from '@assets/types/types';

interface StopRequestType extends MarkerLocation {
    tripId: String;
    stopId: Number;
}

export const POST = async (req: { json: () => PromiseLike<StopRequestType> | StopRequestType; }) => {
    const { tripId, stopId, location, locationName, startDate, endDate, notes } = await req.json();

    try {
        await connectToDB();
        const newStop = new Stop({
            trip: tripId, 
            id: stopId,
            location, locationName, startDate, endDate, notes
        })

        await newStop.save();

        return new Response(JSON.stringify(newStop), { status: 201 })
    } catch (error) {
        console.error("Error creating stop:", error);
        return new Response("Failed to create new stop", { status: 500 });
    }
}