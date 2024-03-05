import { connectToDB } from '@utils/database';
import { NextApiRequest, NextApiResponse } from 'next';
import Resc from '@models/resc';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    try{
        await connectToDB();
        
        const stops = await Resc.find({}).populate('user');

        return new Response(JSON.stringify(stops), {
            status: 200
        })
    } catch(error) {
        return new Response("Failed to fetch all stops", {status: 500})
    }
}