import { connectToDB } from '@utils/database';
import Trip from '@models/trip';
import { StatusType } from '@assets/types/types';

interface TripRequestType {
    userId: String;
    status: StatusType;
}

export const POST = async (req: { json: () => PromiseLike<TripRequestType> | TripRequestType; }) => {
    const { userId, status } = await req.json();
    
    try {
        await connectToDB();
        const newTrip = new Trip({
            name: 'My Trip',
            user: userId,
            status
        })

        await newTrip.save();

        return new Response(JSON.stringify(newTrip), { status: 201 })
    } catch(error) {
        console.error("Error creating new trip:", error);
        return new Response("Failed to create new prompt", { status: 500 })
    }
}