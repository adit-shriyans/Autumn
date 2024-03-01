'use client'

import { MarkerLocation, StopResponseType, TripType } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useSession } from 'next-auth/react';
import { v4 } from 'uuid'
import { z, ZodError } from 'zod';
import { useParams } from 'next/navigation';
import TripModal from '@components/TripModal';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

const geocodingResponseSchema = z.object({
  place_id: z.number(),
  licence: z.string(),
  osm_type: z.string(),
  osm_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  class: z.string(),
  type: z.string(),
  place_rank: z.number(),
  importance: z.number(),
  addresstype: z.string(),
  name: z.string(),
  display_name: z.string(),
  address: z.record(z.unknown()),
  boundingbox: z.array(z.string()),
});

const Home = () => {
  const [stops, setStops] = useState<MarkerLocation[]>([]);
  const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const { data: session } = useSession();
  const [desc, setDesc] = useState<string>('');
  const [addDesc, setAddDesc] = useState(false);
  const [startDate, setStartDate] = useState<string>('');

  useEffect(() => {
    // Fetch current date and format it as dd-mm-yyyy
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setStartDate(formattedDate);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (location) {
        const { latitude, longitude } = location.coords;
        setCoord([latitude, longitude]);
      }, function () {
        console.log('Could not get position');
      });
    }
  }, []);

  const handleSendClick = async () => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0]}&lon=${coord[1]}`);
    const data = await response.json();

    const parsedData = geocodingResponseSchema.parse(data);

    const locationName = parsedData.display_name || 'Unknown Location';

    const createStopResponse = await fetch("/api/stop/new", {
      method: "POST",
      body: JSON.stringify({
        userId: session?.user?.id,
        location: coord,
        locationName,
        startDate: startDate,
        desc: desc,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createStopResponse.ok) {
      console.error('Failed to create trip:', createStopResponse.statusText);
      return;
    }

    const createdStop = await createStopResponse.json();
    console.log(stops, createdStop);
    

    setStops([...stops, { id: createdStop._id, location: createdStop.location, locationName, startDate, desc }])
  }

  const handleMarkClick = () => {
    setAddDesc(true);
    console.log(addDesc);
    
  }

  useEffect(() => {
    console.log(stops);  
  }, [stops]);

  return (
    <div className="Home">
      <div>
        <button onClick={handleMarkClick}>
          Mark garbage
        </button>
        {addDesc && (
          <div>
            <div>
              Your Location
            </div>
            <Box
              component="form"
              sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="outlined-textarea"
                label="Description"
                value={desc}
                placeholder="Add description"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDesc(event.target.value);
                }}
                multiline
              />
            </Box>
            <div>
              <button onClick={handleSendClick}>
                <SendIcon /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
