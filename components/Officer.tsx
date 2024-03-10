import '@styles/css/index.css'
import { MarkerLocation, StopResponseType, TripType } from '@assets/types/types';
import React, { SetStateAction, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { z, ZodError } from 'zod';
import '@styles/css/Officer.css';

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

interface OfficerPropsType {
  stops: MarkerLocation[];
  setStops: React.Dispatch<SetStateAction<MarkerLocation[]>>;
  routes: MarkerLocation[];
  setRoutes: React.Dispatch<SetStateAction<MarkerLocation[]>>;
  coord: L.LatLngTuple;
  setCoord: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
}

const Officer = ({ stops, setStops, routes, setRoutes, coord, setCoord }: OfficerPropsType) => {
  const router = useRouter();
  const {data: session} = useSession();

  const [inputValues, setInputValues] = useState({
    locationName: '',
    dept: '',
    no: '',
    email: '',
  });

  const isFormFilled =
    inputValues.locationName &&
    inputValues.dept &&
    inputValues.no &&
    inputValues.email;

  const [editModes, setEditModes] = useState({
    locationName: false,
    dept: false,
    no: false,
    email: false,
  });

  const LInputRef = useRef<HTMLInputElement | null>(null);
  const DInputRef = useRef<HTMLInputElement | null>(null);
  const NInputRef = useRef<HTMLInputElement | null>(null);
  const EInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0]}&lon=${coord[1]}`);
      const data = await response.json();

      const parsedData = geocodingResponseSchema.parse(data);

      const locationName = parsedData.display_name || 'Unknown Location';
      setInputValues(prev => ({...prev, [locationName]: locationName}))
    }
    fetchName();

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
    const focusInput = (ref: React.RefObject<HTMLInputElement>) => {
      if (ref && ref.current) {
        ref.current.focus();
      }
    };
  
    Object.entries(editModes).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'locationName':
            focusInput(LInputRef);
            break;
          case 'dept':
            focusInput(DInputRef);
            break;
          case 'no':
            focusInput(NInputRef);
            break;
          case 'email':
            focusInput(EInputRef);
            break;
          default:
            break;
        }
      }
    });
  }, [editModes]);

  const handleClick = (key: keyof typeof editModes) => {
    setEditModes(prev => ({ ...prev, [key]: true }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleInputBlur = () => {
    setEditModes({
      locationName: false,
      dept: false,
      no: false,
      email: false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    }
  };

  const handleGoToMapClick = async () => {
    if(isFormFilled) {
      const {locationName, no, dept, email} = inputValues
    const createStopResponse = await fetch("/api/resc/new", {
          method: "POST",
          body: JSON.stringify({
              userId: session?.user.id,
              location: coord,
              locationName,
              no,
              dept,
              email,
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
      console.log(createdStop);
      router.push('/map');
    }
  }

  return (
    <div className="Officer">
      <div className='Officer__info'>
        <div className='Officer__container'>
          <div className='Officer__key'>
            Location
          </div>
          <div className='Officer__val'>
            {editModes.locationName ? (
              <div className='Officer__edit'>
                <input
                  className='Officer__input'
                  name='locationName'
                  ref={LInputRef}
                  value={inputValues.locationName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <div
                className='Officer__data'
                onClick={() => handleClick('locationName')}
              >
                {inputValues.locationName}
              </div>
            )}
          </div>
        </div>
        <div className='Officer__container'>
          <div className='Officer__key'>
            Department
          </div>
          <div className='Officer__val'>
            {editModes.dept ? (
              <div className='Officer__edit'>
                <input
                  className='Officer__input'
                  name='dept'
                  ref={DInputRef}
                  value={inputValues.dept}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <div
                className='Officer__data'
                onClick={() => handleClick('dept')}
              >
                {inputValues.dept}
              </div>
            )}
          </div>
        </div>
        <div className='Officer__container'>
          <div className='Officer__key'>
            Contact No.
          </div>
          <div className='Officer__val'>
            {editModes.no ? (
              <div className='Officer__edit'>
                <input
                  className='Officer__input'
                  name='no'
                  ref={NInputRef}
                  value={inputValues.no}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <div
                className='Officer__data'
                onClick={() => handleClick('no')}
              >
                {inputValues.no}
              </div>
            )}
          </div>
        </div>
        <div className='Officer__container'>
          <div className='Officer__key'>
            Email
          </div>
          <div className='Officer__val'>
            {editModes.email ? (
              <div className='Officer__edit'>
                <input
                  className='Officer__input'
                  name='email'
                  ref={EInputRef}
                  value={inputValues.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <div
                className='Officer__data'
                onClick={() => handleClick('email')}
              >
                {inputValues.email}
              </div>
            )}
          </div>
        </div>
      </div>
      <Button 
        variant='outlined' 
        onClick={handleGoToMapClick}
        disabled={!isFormFilled}
      > 
        <OpenInNewIcon /> View Map
      </Button>
    </div>
  );
};

export default Officer;
