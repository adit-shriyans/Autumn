'use client';

import React, { useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MarkerLocation, VoidFunctionType } from '@assets/types/types';

interface PIPropsType {
    stop: MarkerLocation;
    stops: MarkerLocation[];
    setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
    setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
    setShowDropDown: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddNotes: VoidFunctionType;
}

const UtilityDropDown = ({ stops, setStops, stop, setZoomLocation, setShowDropDown, handleAddNotes }: PIPropsType) => {
    const [copied, setCopied] = useState(false);

    const handleDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const newStops = stops.filter((place) => (place.id !== stop.id));
        setStops(newStops);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (location) {
                const { latitude, longitude } = location.coords;
                const currLocation: L.LatLngTuple = [latitude, longitude];
                setZoomLocation(currLocation);
            }, function () {
                console.log('Could not get position');
            });
        }

        try {
            await fetch(`/api/stop/${stop.id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.log("Error in deleting" + error);
        }
    }

    const handleClick = () => {
        setShowDropDown(false);
    }

    const handleAddNotesClick = () => {
        handleAddNotes();
    }

    return (
        <div
            className='PlaceInfo__dropdown'
            onClick={handleClick}
        >
            <CopyToClipboard
                text={`https://www.google.com/maps?q=${stop.location[0]},${stop.location[1]}`}
                onCopy={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }}>
                <div
                    className='PlaceInfo__container PlaceInfo__container-copy'
                >
                    <div className='PlaceInfo__dropdown-imgContainer PlaceInfo__dropdown-imgContainer-copy'>
                        <ContentCopyIcon style={{ color: '#2962ff' }} />
                    </div>
                    <div className='PlaceInfo__dropdown-text'>
                        Copy
                    </div>
                </div>
            </CopyToClipboard>
            <div
                className='PlaceInfo__container PlaceInfo__container-delete'
                onClick={handleDelete}
            >
                <div className='PlaceInfo__dropdown-imgContainer PlaceInfo__dropdown-imgContainer-delete'>
                    <DeleteOutlineIcon style={{ color: '#d32f2f' }} />
                </div>
                <div className='PlaceInfo__dropdown-text'>
                    Delete
                </div>
            </div>
            <div
                className='PlaceInfo__container PlaceInfo__container-addNotes'
                onClick={handleAddNotesClick}
            >
                <div className='PlaceInfo__dropdown-imgContainer PlaceInfo__dropdown-imgContainer-addNotes'>
                    <AddCircleOutlineIcon style={{ color: '#00c853' }} />
                </div>
                <div className='PlaceInfo__dropdown-text'>
                    Add Notes
                </div>
            </div>
        </div>
    )
}

export default UtilityDropDown