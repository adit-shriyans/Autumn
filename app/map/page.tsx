'use client';

import { MarkerLocation, RescuerInfo, StopResponseType } from '@assets/types/types';
import SidePanel from '@components/SidePanel';
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });

const page = () => {
  const { data: session } = useSession();
  const [distances, setDistances] = useState<Number[]>([]);
  const [stops, setStops] = useState<MarkerLocation[]>([]);
  const [routes, setRoutes] = useState<MarkerLocation[]>([]);
  const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([51.505, -0.09]);
  const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const [rescuersInfo, setRescuersInfo] = useState<RescuerInfo[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoord([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
    const fetchStops = async () => {
      const response = await fetch(`/api/stop`, {
        method: 'GET'
      });
      const data = await response.json();
      console.log("Get", data);
      // data.sort((a: { startDate: number; }, b: { id: number; }) => a.id-b.id);

      setStops(data.map((stop: StopResponseType) => {
        return { id: stop._id, location: stop.location, locationName: stop.locationName, startDate: stop.startDate, desc: stop.desc, notes: stop.notes, type: stop.type, status: stop.status }
      }))
    };

    fetchStops();
  }, []);

  return (
    <div className='TripPage'>
      <SidePanel distances={distances} stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} routes={routes} setRoutes={setRoutes} />
      <DynamicMapComponent stops={stops} setStops={setStops} setDistances={setDistances} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} routes={routes} />
    </div>
  )
}

export default page