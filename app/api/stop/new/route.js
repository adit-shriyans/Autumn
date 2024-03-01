import { connectToDB } from '@utils/database';
import Stop from '@models/stop';
import { MarkerLocation } from '@assets/types/types';
import { v4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

export const POST = async (req, res) => {
    try {
        await connectToDB();

        const { userId, location, locationName, startDate, desc } = req.body;

        const newStop = new Stop({
            id: v4(),
            userId,
            location,
            locationName,
            startDate,
            desc
        });

        await newStop.save();

        return res.status(201).json(newStop);
    } catch (error) {
        console.error("Error creating stop:", error);
        return res.status(500).json({ error: "Failed to create new stop" });
    }
};