'use client';

import React, { useEffect, FC, useRef, useState, MouseEvent } from 'react';
import L, { Map } from 'leaflet';
import CurrentLocationIcon from "../assets/currentlocation.png";
// import CurrentLocationIcon2 from "../assets/currentlocation2.png";
// import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MarkerLocation } from '@assets/types/types';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import '@styles/css/MapComponent.css'
import DraggableMarker from './DraggableMarker';
import { z, ZodError } from 'zod';
import { useParams } from 'next/navigation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Routes from './Routes';

interface MCPropsType {
    stops: MarkerLocation[];
    routes: MarkerLocation[];
    setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
    setDistances: React.Dispatch<React.SetStateAction<Number[]>>;
    zoomLocation: L.LatLngTuple;
    setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
    coord: L.LatLngTuple;
    // setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LMPropsType {
    stops: MarkerLocation[];
    setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
    tripId: String | String[];
    setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
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

function LocationMarker({ stops, setStops, tripId, setZoomLocation }: LMPropsType) {
    const map = useMapEvents({
        async click(e) {
            try {
                // const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                // const data = await response.json();

                // const parsedData = geocodingResponseSchema.parse(data);

                // const locationName = parsedData.display_name || 'Unknown Location';

                // const createStopResponse = await fetch("/api/stop/new", {
                //     method: "POST",
                //     body: JSON.stringify({
                //         stopId: stops.length,
                //         tripId: tripId,
                //         location: [e.latlng.lat, e.latlng.lng],
                //         locationName,
                //         startDate: '',
                //         endDate: '',
                //         notes: ''
                //     }),
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                // });

                // if (!createStopResponse.ok) {
                //     console.error('Failed to create trip:', createStopResponse.statusText);
                //     return;
                // }

                // const createdStop = await createStopResponse.json();

                // setStops([...stops, { id: createdStop._id, location: createdStop.location, locationName }])
                // setZoomLocation(coord);
            } catch (error) {
                if (error instanceof ZodError) {
                    console.error('Validation error:', error.errors);
                } else {
                    console.error('Error fetching location name:', error);
                }
            }
        }
    })

    return null
}

export default function MapComponent({ stops, routes, setStops, setDistances, zoomLocation, setZoomLocation, coord }: MCPropsType) {
    const [showRoutes, setShowRoutes] = useState(false);

    const params = useParams();

    useEffect(() => {
        setZoomLocation(coord);
    }, [coord]);

    const flyToMarker = (map: L.Map, coordinates: L.LatLngTuple, zoom: number) => {
        if (coordinates && typeof coordinates !== "undefined") {
            map.flyTo(coordinates, zoom, {
                animate: true,
                duration: 1.5,
            });
        }
    };

    const ZoomHandler: FC = () => {
        const map = useMap();

        useEffect(() => {
            if (zoomLocation && typeof zoomLocation !== "undefined") {
                flyToMarker(map, zoomLocation, 13);
            }
        }, [zoomLocation]);
        return null;
    };

    function handleToggleRoutes(e: MouseEvent<SVGSVGElement>): void {
        e.stopPropagation();
        if (showRoutes && document) document.querySelector('.MapContainer__routes')?.classList.add('hidden');
        else if(!showRoutes && document) document.querySelector('.MapContainer__routes')?.classList.remove('hidden');
        setShowRoutes((prev) => !prev);
    }

    // function handleSaveClick(e: MouseEvent<HTMLDivElement>): void {
    //     e.stopPropagation();
    //     setShowModal((prev) => !prev);
    // }

    return (
        <div className="MapComponent">
            <div className='MapContainer__userBtns'>
                {/* <div className='MapContainer__save' onClick={() => {}}>
                    Save
                </div> */}
                <DirectionsCarIcon className='MapContainer__carIcon' onClick={handleToggleRoutes} />
            </div>

            <MapContainer className='MapContainer' center={coord} zoom={13} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Routes stops={routes} setDistances={setDistances} coord={coord} />
                <Marker
                    icon={
                        new L.Icon({
                            iconUrl: CurrentLocationIcon.src,
                            iconRetinaUrl: CurrentLocationIcon.src,
                            iconSize: [41, 41],
                            iconAnchor: [12.5, 41],
                            popupAnchor: [0, -41],
                            className: 'CurrentLocation'
                        })
                    }
                    position={coord}
                >
                    <Popup>
                        Your Location
                    </Popup>
                </Marker>
                {stops.map((place) => (
                    <DraggableMarker stops={stops} setStops={setStops} key={place.id} id={place.id} setZoomLocation={setZoomLocation} center={place.location} />
                ))}
                <ZoomHandler />
                <LocationMarker stops={stops} setStops={setStops} tripId={params.id} setZoomLocation={setZoomLocation} />
            </MapContainer>
        </div>
    );
}
