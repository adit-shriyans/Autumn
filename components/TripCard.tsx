'use client'

import { StatusType, TripType } from '@assets/types/types';
import { useRouter } from 'next/navigation';
import demoImg from '../assets/sitedemo.png';
import React, { useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import DeleteIcon from '@mui/icons-material/Delete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcaseRolling } from '@fortawesome/free-solid-svg-icons'
import '@styles/css/TripCard.css';
import Image from 'next/image';

interface TripCardPropsType {
    trip: TripType;
    trips: TripType[];
    setTrips: React.Dispatch<React.SetStateAction<TripType[]>>;
}

const statusOptions = ['upcoming', 'ongoing', 'completed'];
const statusIcons = [<UpcomingIcon />, <FontAwesomeIcon icon={faSuitcaseRolling} />, <CheckCircleOutlineIcon />]

const TripCard = ({ trip, trips, setTrips }: TripCardPropsType) => {
    const [statusId, setStatusId] = useState(statusOptions.indexOf(trip.status.toString()));
    const router = useRouter();

    const updateTrip = async () => {
        const newTrips = trips.map((t) => {
            if(t._id === trip._id) 
                return {...trip, status: statusOptions[(statusId + 1) % 3].toLowerCase() as unknown as StatusType}
            return t;
        })
        setTrips(newTrips);
        try {
            const response = await fetch(`/api/trip/${trip._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: statusOptions[(statusId+1)%3].toLowerCase(),
                    name: newTrips.find((t) => {t._id === trip._id})?.name || 'Trip Name',
                }),
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleTripDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        try {
            await fetch(`/api/trip/${trip._id}`, {
                method: 'DELETE',
            });
            const newTrips = trips.filter((t) => (t._id !== trip._id));
            setTrips(newTrips);
        } catch (error) {
            console.log("Error in deleting" + error);
        }
    }

    const handleStatusChange = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setStatusId((prev) => ((prev + 1) % 3));
        updateTrip();
    }

    return (
        <div className='TripCard' onClick={() => (router.push(`/trip/${trip._id}`))} >
            <div className='TripCard__img'>
                <Image
                    src={demoImg}
                    alt='demo'
                />
            </div>
            <div className='TripCard__name'>
                {trip.name}
            </div>
            <div className='TripCard__btns'>
                <div
                    className='TripCard__btns-status'
                    onClick={handleStatusChange}
                >
                    {statusIcons[statusId]}
                    {statusOptions[statusId].replace(/^./, (char) => char.toUpperCase())}
                </div>
                <div
                    className='TtripCard__btns-delete'
                    onClick={handleTripDelete}
                >
                    <DeleteIcon />
                    Delete
                </div>
            </div>
        </div>
    )
}

export default TripCard