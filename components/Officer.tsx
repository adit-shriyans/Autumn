"use client";
import '@styles/css/index.css'
import { MarkerLocation, StopResponseType, TripType } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { SetStateAction, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useRouter } from 'next/navigation';

// const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });

interface OfficerPropsType {
    stops: MarkerLocation[];
    routes: MarkerLocation[];
    setStops: React.Dispatch<SetStateAction<MarkerLocation[]>>;
    setRoutes: React.Dispatch<SetStateAction<MarkerLocation[]>>;
    coord: L.LatLngTuple;
}

const Officer = ({stops, setStops, routes, setRoutes, coord}: OfficerPropsType ) => {
//   const [stops, setStops] = useState<MarkerLocation[]>([]);
//   const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([51.505, -0.09]);
  const router = useRouter();
  const [distances, setDistances] = useState<Number[]>([]);
//   const [showModal, setShowModal] = useState(false);

  const params = useParams();

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if(active.id === over?.id) return;

    setStops(stops => {
      const originalId = stops.findIndex(stop => stop.id === active.id);
      const newId = stops.findIndex(stop => stop.id === over?.id);
      return arrayMove(stops, originalId, newId);
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }) 
  )

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(function (location) {
//         const { latitude, longitude } = location.coords;
//         setCoord([latitude, longitude]);
//       }, function () {
//         console.log('Could not get position');
//       });
//     }
//   }, []);

  useEffect(() => {
    const fetchStops = async () => {
      const response = await fetch(`/api/stop/${params?.id}`, {
        method: 'GET'
      });
      const data = await response.json();
      data.sort((a: { id: number; }, b: { id: number; }) => a.id-b.id);

      setStops(data.map((stop: StopResponseType) => {
        return { id: stop._id, location: stop.location, locationName: stop.locationName, startDate: stop.startDate, notes: stop.notes }
      }))
    };

    if (params?.id) fetchStops();
  }, [params.id]);

  return (
    <div className="TripPage">
      <div>
        Notifications
      </div>
      <div>
        Eemrgencies
      </div>
      <Button variant='outlined' onClick={() => (router.push('/map'))}> <OpenInNewIcon /> View Map</Button>
      {/* <SidePanel distances={distances} stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} routes={routes} setRoutes={setRoutes} />
      <DynamicMapComponent stops={stops} setStops={setStops} setDistances={setDistances} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} routes={routes} /> */}
    </div>
  );
};

export default Officer;