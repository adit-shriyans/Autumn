"use client";
// import '@styles/css/index.css'
// import { StatusType, TripType, VoidFunctionType } from '@assets/types/types';
import { SetStateAction, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import { Box, Button, TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import { MarkerLocation, StopResponseType } from '@assets/types/types';
import { z, ZodError } from 'zod';
import '../styles/css/Resident.css';
import RequestInfo from './RequestInfo';
import { setArr, setBool } from "@redux/features/user-slice";
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@redux/store';
import { io } from 'socket.io-client';

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
    setCoord: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
}

const types = ['Fire', 'Earthquake', 'Flood', 'Gas Leak', 'Pest Control', 'Security Breach', 'Wild Animal', 'Robbery/Tresspassing', 'Accident'];
types.sort();

const Resident = ({stops, setStops, coord, setCoord}: RPropsType) => {
//   const [stops, setStops] = useState<MarkerLocation[]>([]);
//   const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const { data: session } = useSession();
  const [desc, setDesc] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [addDesc, setAddDesc] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [distances, setDistances] = useState<Number[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [userStops, setUserStops] = useState<MarkerLocation[]>([]);
  const [socket, setSocket] = useState<any>(undefined);

  const redSt = useAppSelector((state) => state.userReducer.arr);

  useEffect(() => {
    console.log(redSt);
  }, []);


  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setStartDate(formattedDate);

    //socket
    const socket = io("https://dmsbackend-ek55.onrender.com");
    setSocket(socket);

    // const fetchUserStops = async () => {
    //   const response = await fetch(`/api/stop/${session?.user.id}`, {
    //     method: 'GET'
    //   });
    //   const data = await response.json();

    //   const newUserStops = data.map((stop: StopResponseType) => {
    //     return {id: stop._id, location: stop.location, locationName:stop.locationName, startDate: stop.startDate, desc: stop.desc, notes: stop.notes, type: stop.type, status: stop.status };
    //   });
    //   console.log("fetch", newUserStops, data);

    //   setUserStops(newUserStops)
    // }
    // if(session?.user.id) fetchUserStops();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (location) {
        const { latitude, longitude } = location.coords;
        setCoord([latitude, longitude]);
      }, function () {
        console.log('Could not get position');
      });
    }
  }, []);

  useEffect(() => {
    const fetchUserStops = async () => {
      const response = await fetch(`/api/stop/${session?.user.id}`, {
        method: 'GET'
      });
      const data = await response.json();

      const newUserStops = data.map((stop: StopResponseType) => {
        return {id: stop._id, location: stop.location, locationName:stop.locationName, startDate: stop.startDate, desc: stop.desc, notes: stop.notes, type: stop.type, status: stop.status };
      });
      console.log("fetch", newUserStops, data);

      setUserStops(newUserStops)
    }
    if(session?.user.id) fetchUserStops();
  }, [session]);

  useEffect(() => {
    const fetchName = async () => {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0]}&lon=${coord[1]}`);
      const data = await response.json();

      const parsedData = geocodingResponseSchema.parse(data);

      const locationName = parsedData.display_name || 'Unknown Location';
      setLocationName(locationName);
    }
    fetchName();
  }, [coord]);

  const handleSendClick = async () => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0]}&lon=${coord[1]}`);
    const data = await response.json();
    const parsedData = geocodingResponseSchema.parse(data);
    const locationName = parsedData.display_name || 'Unknown Location';
    setLocationName(locationName);

    const createStopResponse = await fetch("/api/stop/new", {
          method: "POST",
          body: JSON.stringify({
              userId: session?.user.id,
              location: coord,
              locationName,
              startDate,
              desc,
              notes: '',
              type,
              status: 'Upcoming',
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

    setStops([...stops, { id: createdStop._id, startDate, location: coord, locationName, notes: createdStop.notes, desc, type, status: 'Upcoming'}]);
    dispatch(setArr([...redSt, { id: createdStop._id, startDate, location: coord, locationName, notes: createdStop.notes, desc, type, status: 'Upcoming'}]));
    
    //socket
    socket.emit("new victim stop", [...stops, { id: createdStop._id, startDate, location: coord, locationName, notes: createdStop.notes, desc, type, status: 'Upcoming'}]);

    setAddDesc(false);
  }

  return (
    <div className="Resident">
      <div className='Resident__container'>
        <div className='Resident__location'>
          Your Location 
          <div className='Resident__location-name'>{locationName}</div>
        </div>
        <div className='Resident__victimInfo'>
          <Button variant='outlined' className='Resident__victimInfo-mark' onClick={() => (setAddDesc(prev => !prev))}>Mark emergency</Button>
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
              <div className='Resident__victimInfo-desc'>
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
                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={type}
                  label="Type"
                  onChange={(event) => {
                    setType(event.target.value);
                  }}
                >
                  {types.map((type, id) => (
                    <MenuItem key={id} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </div>
            </Box>
            <Button variant='outlined' className='Resident__victimInfo-send' onClick={handleSendClick}>
              <SendIcon /> Send
            </Button>
            </>
          )}
        </div>
        <div className='Resident__requests'>
          <div className='Resident__requests-heading'>
            Your Requests
          </div>
          <div className='Resident__requests-reqs'>
            {userStops.map((stop, id) => (
              <div key={id} className='Resident__requests-req'>
                <RequestInfo key={id} distances={distances} setTotalDistance={setDistance} stops={userStops} setStops={setStops} stop={stop} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resident;