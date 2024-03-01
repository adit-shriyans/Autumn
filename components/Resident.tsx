"use client";
// import '@styles/css/index.css'
// import { StatusType, TripType, VoidFunctionType } from '@assets/types/types';
import { SetStateAction, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import { Box, Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { MarkerLocation } from '@assets/types/types';
import { z, ZodError } from 'zod';
import {v4} from 'uuid';
import '../styles/css/Resident.css';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: string;
    };
  }
}

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

interface RPropsType {
    stops: MarkerLocation[];
    setStops: React.Dispatch<SetStateAction<MarkerLocation[]>>;
    coord: L.LatLngTuple;
}

const Resident = ({stops, setStops, coord}: RPropsType) => {
//   const [stops, setStops] = useState<MarkerLocation[]>([]);
//   const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const { data: session } = useSession();
  const [desc, setDesc] = useState<string>('');
  const [addDesc, setAddDesc] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    // Fetch current date and format it as dd-mm-yyyy
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setStartDate(formattedDate);
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0] || 55}&lon=${coord[1] || 55}`);
      const data = await response.json();

      const parsedData = geocodingResponseSchema.parse(data);

      const locationName = parsedData.display_name || 'Unknown Location';
      setLocationName(locationName);
    }
    fetchName();
  }, [coord]);

  const handleSendClick = async () => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0] || 55}&lon=${coord[1] || 55}`);
    const data = await response.json();

    const parsedData = geocodingResponseSchema.parse(data);

    const locationName = parsedData.display_name || 'Unknown Location';
    setLocationName(locationName);

    setStops([...stops, { id: v4(), location: coord, locationName, desc }]);
    setAddDesc(false);
  }

  return (
    <div className="Resident">
      <div className='Resident__container'>
        <div className='Resident__location'>
          Your Location
          <div className='Resident__location-name'>{locationName}</div>
        </div>
        <div className='Resident__garbageInfo'>
          <Button variant='outlined' className='Resident__garbageInfo-mark' onClick={() => (setAddDesc(prev => !prev))}>Mark Garbage</Button>
          {addDesc && (
            <>
            <Box
              component="form"
              sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <div className='Resident__garbageInfo-desc'>
                <TextField
                  id="outlined-textarea"
                  label="Description"
                  value={desc}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setDesc(event.target.value);
                  }}
                  // placeholder="Add description"
                  multiline
                />
              </div>
            </Box>
            <Button variant='outlined' className='Resident__garbageInfo-send' onClick={handleSendClick}>
              <SendIcon /> Send
            </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resident;