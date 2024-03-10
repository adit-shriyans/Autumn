import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
import { NextRequest } from 'next/server';
// import { StopResponseType } from '@assets/types/types';

interface StopRequestType {
    location: L.LatLngTuple; 
    locationName: String;
    startDate: String; 
    notes: String;
    desc: String;
    type: String;
    status: String;
}

// GET
export const GET = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();

        const stops = await Stop.find({
            user: params.id
        }).populate('user');

        return new Response(JSON.stringify(stops), {
            status: 200
        });
    } catch(error) {
        console.error(error);
        return new Response("Failed to fetch all prompts", { status: 500 });
    }
}

// PATCH
export const PATCH = async (request: { json: () => PromiseLike<StopRequestType> | StopRequestType; }, { params }: { params: { id: string } }) => {
    const { location, locationName, startDate, desc, notes, type, status } = await request.json();

    try {
        await connectToDB();
        let existingStop = await Stop.findById(params.id);

        if (!existingStop) {
            return new Response("Stop not found", { status: 404 });
        }

        existingStop.location = location;
        existingStop.locationName = locationName;
        existingStop.startDate = startDate;
        existingStop.notes = notes;
        existingStop.desc = desc;
        existingStop.type = type;
        existingStop.status = status;

        await existingStop.save();

        return new Response(JSON.stringify(existingStop), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update stop", { status: 500 });
    }
};

// DELETE
export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        await Stop.findByIdAndDelete(params.id);

        return new Response("Stop deleted successfully", { status: 200 });
    } catch (error) {
        console.error(error)
        return new Response("Failed to delete stop", { status: 500 });
    }
}