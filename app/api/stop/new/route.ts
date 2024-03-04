import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
import { MarkerLocation } from '@assets/types/types';
import { v4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

interface StopRequestType extends MarkerLocation {
    userId: String;
}

export const POST = async (req: { json: () => PromiseLike<StopRequestType> | StopRequestType; }) => {
    try {
        await connectToDB();

        const { userId, location, locationName, startDate, desc, type, status } = await req.json();

        const newStop = new Stop({
            user: userId,
            location,
            locationName,
            startDate,
            desc,
            notes: '',
            type,
            status,
        });

        await newStop.save();

        return new Response(JSON.stringify(newStop), { status: 201 })
    } catch (error) {
        console.error("Error creating stop:", error);
        return new Response("Failed to create new stop", { status: 500 });
    }
};
