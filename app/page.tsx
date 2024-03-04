"use client";
// import '@styles/css/index.css'
// import { StatusType, TripType, VoidFunctionType } from '@assets/types/types';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import { Box, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { MarkerLocation } from '@assets/types/types';
import { z, ZodError } from 'zod';
import {v4} from 'uuid';
import Officer from '@components/Officer';
import Resident from '@components/Resident';
import {setArr, setBool} from '@redux/features/user-slice';
import { UseDispatch, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, useAppSelector } from '@redux/store';
import { useRouter } from 'next/navigation';

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

const MyPage = () => {
  const [stops, setStops] = useState<MarkerLocation[]>([]);
  const [routes, setRoutes] = useState<MarkerLocation[]>([]);
  const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const { data: session } = useSession();
  const [desc, setDesc] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [addDesc, setAddDesc] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [formData, setFormData] = useState('');
  
  // const {data: session} = useSession();

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

  // const handleSendClick = async () => {
  //   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0] || 55}&lon=${coord[1] || 55}`);
  //   const data = await response.json();

  //   const parsedData = geocodingResponseSchema.parse(data);

  //   const locationName = parsedData.display_name || 'Unknown Location';

  //   setStops([...stops, { id: session?.user.id!, location: coord, locationName, desc, type }])
  // }

  return (
    <div>
      {/* <Resident stops={stops} setStops={setStops} coord={coord} /> */}
      {session?.user.role === 'admin' ? (<Officer stops={stops} setStops={setStops} coord={coord} routes={routes} setRoutes={setRoutes} />) : (<Resident stops={stops} setStops={setStops} coord={coord} />)}
    </div>
  );
};

export default MyPage;