import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Resc from '@models/resc';
// import { StopResponseType } from '@assets/types/types';

interface RescRequestType {
    location: L.LatLngTuple; 
    locationName: String;
    no: String; 
    email: String;
    dept: String;
}

// GET
export const GET = async (request: Request | NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();

        const stops = await Resc.find({
            userId: params.id
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
export const PATCH = async (request: { json: () => PromiseLike<RescRequestType> | RescRequestType; }, { params }: { params: { id: string } }) => {
    const { location, locationName, no, email, dept} = await request.json();

    try {
        await connectToDB();
        let existingRescs = await Resc.findById(params.id);

        if (!existingRescs) {
            return new Response("Resc not found", { status: 404 });
        }

        existingRescs.location = location;
        existingRescs.locationName = locationName;
        existingRescs.no = no;
        existingRescs.email = email;
        existingRescs.dept = dept;

        await existingRescs.save();

        return new Response(JSON.stringify(existingRescs), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update stop", { status: 500 });
    }
};

// DELETE
export const DELETE = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        await Resc.findByIdAndDelete(params.id);

        return new Response("Resc deleted successfully", { status: 200 });
    } catch (error) {
        console.error(error)
        return new Response("Failed to delete stop", { status: 500 });
    }
}