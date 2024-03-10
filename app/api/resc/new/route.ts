import { connectToDB } from '@utils/database';
import Resc from '@models/resc';
import { MarkerLocation } from '@assets/types/types';
import { v4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

interface RescRequestType {
    userId: string;
    location: L.LatLngTuple; 
    locationName: String;
    no: String; 
    email: String;
    dept: String;
}

export const POST = async (req: Request | NextRequest) => {
    try {
        await connectToDB();

        const { userId, location, locationName, no, email, dept} = await req.json();


        const newResc = new Resc({
            user: userId,
            location,
            locationName,
            no,
            email,
            dept,
        });

        await newResc.save();

        return new Response(JSON.stringify(newResc), { status: 201 })
    } catch (error) {
        console.error("Error creating stop:", error);
        return new Response("Failed to create new stop", { status: 500 });
    }
};
