import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
// import { StopResponseType } from '@assets/types/types';

interface StopRequestType {
    index: number;
    location: L.LatLngTuple; 
    locationName: String;
    startDate: String; 
    endDate: String; 
    notes: String;
}

// GET
// export const GET = async (request: Request | NextApiRequest, { params }: { params: { id: string } }) => {
//     try {
//         await connectToDB();

//         const stops = await Stop.find({
//             userId: params.id
//         }).populate('user');

//         return new Response(JSON.stringify(stops), {
//             status: 200
//         });
//     } catch(error) {
//         console.error(error);
//         return new Response("Failed to fetch all prompts", { status: 500 });
//     }
// }

// PATCH
export const PATCH = async (request: { json: () => PromiseLike<StopRequestType> | StopRequestType; }, { params }: { params: { id: string } }) => {
    const { index, location, locationName, startDate, endDate, notes } = await request.json();

    try {
        await connectToDB();
        let existingStop = await Stop.findById(params.id);
        
        if (!existingStop) {
            return new Response("Stop not found", { status: 404 });
        }

        existingStop.id = index;
        existingStop.location = location;
        existingStop.locationName = locationName;
        existingStop.startDate = startDate;
        existingStop.endDate = endDate;
        existingStop.notes = notes;
        
        await existingStop.save();

        return new Response(JSON.stringify(existingStop), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update stop", { status: 500 });
    }
};

// DELETE
export const DELETE = async (request: NextApiRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        await Stop.findByIdAndDelete(params.id);

        return new Response("Stop deleted successfully", { status: 200 });
    } catch (error) {
        console.error(error)
        return new Response("Failed to delete stop", { status: 500 });
    }
}
