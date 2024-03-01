import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
import { MarkerLocation, StatusType } from '@assets/types/types';
import {v4} from 'uuid';

interface StopRequestType extends MarkerLocation {
    userId: string,
}

export const POST = async (req: { json: () => PromiseLike<StopRequestType> | StopRequestType; }) => {
    const { userId, location, locationName, startDate, desc } = await req.json();

    try {
        await connectToDB();
        const newStop = new Stop({
            id: v4(), userId, location, locationName, startDate, desc
        })

        await newStop.save();

        return new Response(JSON.stringify(newStop), { status: 201 })
    } catch (error) {
        console.error("Error creating stop:", error);
        return new Response("Failed to create new stop", { status: 500 });
    }
}