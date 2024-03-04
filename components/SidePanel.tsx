'use client';

import React, { useEffect, useState, ChangeEvent, useRef, useMemo } from 'react';
import '../styles/css/SidePanel.css';
import PlaceInfo from './PlaceInfo';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TocIcon from '@mui/icons-material/Toc';
import totalDistImg from '../assets/totalDistance.png';
import Image from 'next/image';
import { MarkerLocation, searchResultType } from '@assets/types/types';
import { z, ZodError } from 'zod';
import { calculateDistance, compareDates, getNumberOfDays, getTodaysDate, isValidDate } from '@assets/CalcFunctions';
import { useParams } from 'next/navigation';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import '../node_modules/leaflet-geosearch/dist/geosearch.css';
import { SearchResult } from 'leaflet-geosearch/dist/providers/provider.js';
import { RawResult } from 'leaflet-geosearch/dist/providers/openStreetMapProvider.js';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useSession } from 'next-auth/react';

interface SPPropsType {
  distances: Number[];
  stops: MarkerLocation[];
  routes: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
  coord: L.LatLngTuple;
}

const types = ['Fire', 'Earthquake', 'Flood', 'Gas Leak', 'Pest Control', 'Security Breach', 'Wild Animal', 'Robbery/Tresspassing', 'Accident'];

const geocodingResponseSchema = z.array(
  z.object({
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
    boundingbox: z.array(z.string()),
  })
);

const SidePanel = ({ distances, stops, setStops, setZoomLocation, coord, routes, setRoutes }: SPPropsType) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult<RawResult>[]>([]);
  const [addingLocation, setAddingLocation] = useState(false);
  const [addCoords, setAddCoords] = useState<L.LatLngTuple | []>([]);
  const [reqLocation, setReqLocation] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [tripDates, setTripDates] = useState<string[]>([getTodaysDate(), getTodaysDate()]);
  const [noOfDays, setNoOfDays] = useState<number>(0);
  const [dndEnable, setDndEnable] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const addStopRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const params = useParams();

  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  // Function to group stops by types
  const groupByType = (stops: MarkerLocation[], type: string) => {
    if (type === 'All') return stops;
    return stops.filter(stop => stop.type === type);
  };

  // Function to group stops by status
  const groupByStatus = (stops: MarkerLocation[], status: string) => {
    if (status === 'All') return stops;
    return stops.filter(stop => stop.status === status);
  };

  // Function to sort stops by date
  const sortStopsByDate = (stops: MarkerLocation[], sortOrder: string) => {
    const filteredStops = stops.filter(stop => stop.startDate !== undefined);
    
    const sortedStops = filteredStops.sort((a, b) => {
      if (a.startDate && b.startDate) {
        return sortOrder === 'asc' 
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0; // Handle case where startDate is undefined
    });
  
    return sortedStops;
  };
  

  // Filtered and sorted stops
  const filteredStops = useMemo(() => {
    let filtered = groupByType(stops, selectedType);
    filtered = groupByStatus(filtered, selectedStatus);
    filtered = sortStopsByDate(filtered, sortOrder);
    return filtered;
  }, [stops, selectedType, selectedStatus, sortOrder]);

  useEffect(() => {
    console.log(filteredStops);
  }, [filteredStops]);

  useEffect(() => {
    let dist = 0;
    let sDate = stops[0]?.startDate || getTodaysDate();
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].startDate !== undefined && compareDates(stops[i].startDate!, tripDates[0]) === -1) setTripDates([stops[i].startDate!, tripDates[1]])
      if (i === 0) dist += parseFloat(calculateDistance(stops[i].location, coord).toFixed(2))
      else dist += parseFloat(calculateDistance(stops[i].location, stops[i - 1].location).toFixed(2))
    }
    let tripDist = 0;
    distances.forEach((dist) => tripDist += Number(dist));
    const setDist = tripDist === 0 ? parseFloat(dist.toFixed(2)) : tripDist;
    setTotalDistance(dist);
  }, [stops])

  useEffect(() => {
    if (isValidDate(tripDates[0]) && isValidDate(tripDates[1]))
      setNoOfDays(getNumberOfDays(tripDates[0], tripDates[1]));
  }, [tripDates[0], tripDates[1]]);

  useEffect(() => {
    if (addingLocation) {
      inputRef.current?.focus();
    }
  }, [addingLocation]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(true);
      const element = document.querySelector('.SidePanel');
      const distance = element?.scrollTop;
      document.documentElement.style.setProperty('--scroll-distance', `${distance}px`);
    };

    const element = document.querySelector('.SidePanel');
    element?.addEventListener('scroll', handleScroll);

    return () => {
      element?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addStopRef.current && !addStopRef.current?.contains(e.target as Node)) {
        setAddingLocation(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const addManualLocation = () => {
    if (reqLocation) {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(reqLocation)}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const parsedData = geocodingResponseSchema.safeParse(data);

          if (parsedData.success) {
            const location = parsedData.data[0];
            const latitude = parseFloat(location.lat);
            const longitude = parseFloat(location.lon);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              setAddCoords([latitude, longitude]);
            } else {
              console.error(`Invalid latitude or longitude for ${reqLocation}`);
            }
          } else {
            console.error('Geocoding response validation error:', parsedData.error);
          }
        })
        .catch(error => console.error('Error fetching geocoding data', error));
    }
  };

  const markNewLocation = async ([latitude, longitude]: L.LatLngTuple, locationName: string) => {
    const createStopResponse = await fetch("/api/stop/new", {
      method: "POST",
      body: JSON.stringify({
        userId: session?.user.id,
        location: coord,
        locationName,
        startDate: getTodaysDate(),
        desc: '',
        notes: '',
        type: 'Manual',
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

    setStops([...stops, { id: createdStop._id, location: createdStop.location, locationName: createdStop.locationName, type: 'Manual', status: 'Manual' }])
  }

  const handleAddFormChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setReqLocation(e.target.value);
    if (e.target.value) {
      try {
        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query: e.target.value });
        if (e.target.value) setSearchResults(results);
      } catch (err) {
        console.error("Error loading search results", err);
      }
    }
    else setSearchResults([]);
  }

  const handleSearchResultsClick = (res: SearchResult<RawResult>, e: MouseEvent) => {
    e.preventDefault();
    setAddCoords([res.y, res.x]);
    markNewLocation([res.y, res.x], res.label);
    setZoomLocation([res.y, res.x]);
    setReqLocation('');
    setAddingLocation(false);
    setSearchResults([]);
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualLocation();
      if (addCoords.length !== 0) {
        markNewLocation(addCoords, reqLocation);
        setZoomLocation(addCoords);
      }
      setReqLocation('');
      setAddingLocation(false);
      setSearchResults([]);
    }
  }

  const handleAddRouteClick = () => {

  }

  return (
    <div className={`SidePanel ${scrolled ? 'SideWindow' : ''}`}>
      <h1 className='SidePanel__heading'>Waste Dump Locations</h1>
      <div className='TripInfo'>
        <div className='TripInfo__dist'>
          <div className='TripInfo__dist-img'>
            <Image src={totalDistImg} alt='total distance' />
          </div>
          <div className='TripInfo__dist-text'>
            {totalDistance ? totalDistance.toFixed(2) : 0}km
          </div>
        </div>

        <div className='TripInfo__days'>
          <div className='TripInfo__days-img'>
            <EventNoteIcon />
          </div>
          <div className='TripInfo__days-text'>
            {noOfDays} Days
          </div>
        </div>
      </div>
      <div className='TripInfo__categories'>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel>Select Type</InputLabel>
          <Select
            value={selectedType}
            onChange={(e: SelectChangeEvent<string>) => setSelectedType(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {types.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Selector for status */}
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel>Select Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e: SelectChangeEvent<string>) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Selector for sort order */}
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel>Sort By Date</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e: SelectChangeEvent<string>) => setSortOrder(e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>
      </div>
      <div
        className='addStop'
        ref={addStopRef}
      >
        <div
          className='addStop__content'
          tabIndex={0}
          onClick={() => setAddingLocation((prev) => !prev)}
        >
          <div
            className='addStop__img'
          >
            <AddLocationAltIcon />
          </div>
          <div
            className='addStop__heading'
          >
            Add Location
          </div>
        </div>
        <form className={`addStop__form ${addingLocation ? '' : 'hidden'}`}>
          <input
            className='addStop__input'
            value={reqLocation}
            onChange={handleAddFormChange}
            onKeyDown={handleInputKeyDown}
            ref={inputRef}
            placeholder='Enter Location Name'
          />
        </form>
      </div>
      {searchResults.length > 0 && addingLocation ? (<div className='addStop__searchResult'>
        {searchResults.map((res, index) => {
          return (
            <div className='addStop__result' key={index} onClick={(e) => handleSearchResultsClick(res, e as unknown as MouseEvent)}>
              {res.label}
            </div>
          )
        })}
      </div>) : ''}
      <div
        className='SidePanel__Home'
        onClick={() => { setZoomLocation(coord) }}
      >
        <div className='SidePanel__Home-img'>
          <MyLocationIcon />
        </div>
        <div
          className='SidePanel__Home-text'
        >
          Your Location
        </div>
      </div>
      {stops.length > 0 ? (
        <div className='StopInfo__container'>
          <SortableContext
            items={stops}
            strategy={verticalListSortingStrategy}
          >
            {stops.map((stop) => (
              <div key={stop.id} className='StopInfo'>
                <PlaceInfo key={stop.id} distances={distances} stop={stop} stops={stops} setStops={setStops} setTotalDistance={setTotalDistance} setZoomLocation={setZoomLocation} dndEnable={dndEnable} routes={routes} setRoutes={setRoutes} />
              </div>
            ))}
          </SortableContext>
        </div>
      ) :
        (
          <div className='SidePanel__filler'>
            <p>or</p>
            <h2>Click on the map</h2>
          </div>
        )}
    </div>
  )
}

export default SidePanel