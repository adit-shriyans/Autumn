'use client';

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faRoute } from '@fortawesome/free-solid-svg-icons'
import TodayIcon from '@mui/icons-material/Today';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditNoteIcon from '@mui/icons-material/EditNote';
import UtilityDropDown from './UtilityDropDown';
import { MarkerLocation } from '@assets/types/types';
import { calculateDistance, getTodaysDate, isValidDate } from '@assets/CalcFunctions';
// import '../styles/css/PlaceInfo.css';

interface RIPropsType {
  distances: Number[];
  stop: MarkerLocation;
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<number>>;
}

const arraySize = 6;

const RequestInfo = ({ distances, stop, stops, setStops, setTotalDistance }: RIPropsType) => {
  const locationNameArr = stop.locationName.split(',');
  let name = locationNameArr[0];
  if (locationNameArr.length > 1) {
    name = name + `, ${locationNameArr[1]}`
  }

  const [inputValues, setInputValues] = useState({
    locationName: stop.locationName,
    inDate: stop.startDate || getTodaysDate(),
    // outDate: stop.endDate || getTodaysDate(),
    notesMsg: '',
    desc: stop.desc,
  });

  const [distValues, setDistValues] = useState({
    locationDist: 10,
    homeDist: 20,
  })

  const [editMode, setEditMode] = useState(Array(arraySize).fill(false));
  const [showErr, setShowErr] = useState(Array(arraySize).fill(false));
  const [errMsg, setErrMsg] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [addRoute, setAddRoute] = useState(false);
  const [added, setAdded] = useState(false);
  const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([50, 50]);

  const LNInputRef = useRef<HTMLInputElement | null>(null);
  const LDInputRef = useRef<HTMLInputElement | null>(null);
  const HDInputRef = useRef<HTMLInputElement | null>(null);
  const IDInputRef = useRef<HTMLInputElement | null>(null);
  const ODInputRef = useRef<HTMLInputElement | null>(null);
  const NotesInputRef = useRef<HTMLInputElement | null>(null);

  const getLocationDist = () => {
    return distances[stops.indexOf(stop)] || 0;
  }

  const getHomeDist = () => {
    const stopId = stops.indexOf(stop);
    let homeDist = 0;
    for (let i = 0; i <= stopId; i++) {
      homeDist += Number(distances[i]);
    }
    return homeDist;
  }

  const handleClick = (id: number) => {
    if (!editMode[id]) {
      let newEditMode = Array(arraySize).fill(false);
      newEditMode[id] = !editMode[id];
      setEditMode(newEditMode);
    }
  };

  const handleAddNotes = () => {
    setShowNotes(true);
    const newEditMode = editMode;
    newEditMode[5] = true;
    setEditMode(newEditMode);
    if (NotesInputRef.current) {
      NotesInputRef.current.focus();
    }
  }

  const handleDropdownClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setShowDropDown(() => (!showDropDown));
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrMsg('');
    setShowErr(Array(arraySize).fill(false));

    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };


  const handleInputBlur = () => {
    const { locationName, inDate, notesMsg } = inputValues

    if (locationName) {
        if (notesMsg === '')
          setShowNotes(false);
        setEditMode(Array(arraySize).fill(false));
    }
    else {
      setErrMsg("This field is required");
      focusOnEmptyField();
    }
  };

  const saveStops = async () => {
    console.log(stop);
    const {location, locationName, startDate, notes, desc, type, status} = stop
    const res = await fetch(`/api/stop/${stop.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            location, 
            locationName, 
            startDate, 
            desc, 
            notes,
            status, type,
        })
      })
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { locationName, inDate, notesMsg } = inputValues
    if (e.key === 'Enter') {
      if (locationName && inDate) {
        if (isValidDate(inDate)) {
          if (notesMsg === '')
            setShowNotes(false);
          setEditMode(Array(arraySize).fill(false));
        }
        else if (!isValidDate(inDate)) {
          e.preventDefault();
          setErrMsg("Date not in format DD/MM/YY");
          focusOnEmptyField();
        }
      }
      else {
        e.preventDefault();
        setErrMsg("Can't leave field empty");
        focusOnEmptyField();
      }
    }
  };

  const focusOnEmptyField = () => {
    if (editMode[0] && LNInputRef.current) {
      LNInputRef.current.focus();
      setShowErr([true, false, false, false, false])
    }
    else if (editMode[1] && LDInputRef.current) {
      LDInputRef.current.focus();
      setShowErr([false, true, false, false, false])
    }
    else if (editMode[2] && HDInputRef.current) {
      HDInputRef.current.focus();
      setShowErr([false, false, true, false, false])
    }
    else if (editMode[3] && IDInputRef.current) {
      IDInputRef.current.focus();
      setShowErr([false, false, false, true, false])
    }
    else if (editMode[4] && ODInputRef.current) {
      ODInputRef.current.focus();
      setShowErr([false, false, false, false, true])
    }
  };

  const setDists = () => {
    if (distances.length >= stops.length) {
      let dist = 0;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (location) {
          const { latitude, longitude } = location.coords;
          dist = calculateDistance(stop.location, [latitude, longitude]);
          const setDist = getHomeDist() === 0 ? dist : Number(getHomeDist());
          setDistValues((prev) => ({
            ...prev,
            homeDist: parseFloat(setDist.toFixed(2))
          }))
          const index = stops.indexOf(stop);
          if (index === 0) {
            const setDist = getLocationDist() === 0 ? dist : Number(getLocationDist());
            setDistValues((prev) => ({
              ...prev,
              locationDist: parseFloat(setDist.toFixed(2))
            }))
          }
          if (index === stops.length - 1)
            setTotalDistance(Number(getHomeDist()));
        }, function () {
          console.log('Could not get position');
        });
      }

      const index = stops.indexOf(stop);
      if (index > 0) {
        const dist2 = calculateDistance(stop.location, stops[index - 1].location);
        const setDist2 = getLocationDist() === 0 ? dist2 : Number(getLocationDist());
        setDistValues((prev) => ({
          ...prev,
          locationDist: parseFloat(setDist2.toFixed(2))
        }));
      }
    }
  }

  useEffect(() => {
    if (editMode[0] && LNInputRef.current) {
      LNInputRef.current.focus();
    }
    else if (editMode[3] && IDInputRef.current) {
      IDInputRef.current.focus();
    }
    else if (editMode[4] && ODInputRef.current) {
      ODInputRef.current.focus();
    }
    else if (editMode[5] && NotesInputRef.current) {
      NotesInputRef.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    // updateStop();
    if(!editMode[0]){
      const newStops = stops.map((place) => {
        if (place.id === stop.id) {
          place.locationName = inputValues.locationName;
        }
        return place;
      });
      setStops(newStops);
    }
    // else LNInputRef?.current?.focus();
    saveStops();
  }, [inputValues.locationName, editMode[0]])

  useEffect(() => {
    const locationNameArr = stop.locationName.split(',');
    let newName = locationNameArr[0];
    if (locationNameArr.length > 1) {
      newName = newName + `, ${locationNameArr[1]}`
    }
    setInputValues((prev) => ({
      ...prev,
      locationName: newName
    }));
    saveStops();
  }, [stop.location])

  useEffect(() => {
    setDists();
  }, [distances])

  useEffect(() => {
    saveStops();
  }, [stop.desc, inputValues.desc]);

  useEffect(() => {
    // updateStop();
    if(!editMode[3] && !editMode[4] && !editMode[5]) {
      const newStops = stops.map((place) => {
        if (stop.id === place.id) {
          return { ...place, startDate: inputValues.inDate, notes: inputValues.notesMsg }
        }
        return place;
      })
      setStops(newStops)
    }
    else if(editMode[3]) IDInputRef.current?.focus();
    else if(editMode[4]) ODInputRef.current?.focus();
    else if(editMode[5]) NotesInputRef.current?.focus();
  }, [inputValues.inDate, inputValues.notesMsg, editMode[3], editMode[4], editMode[5]]);
  
  return (
    <div
      className='PlaceInfo'
    //   onClick={() => { setZoomLocation(stop.location); setAddRoute(prev => !prev) }}
    >
      <div
          className='PlaceInfo__dropdownbtn-container'
          tabIndex={0}
          onFocusCapture={() => setShowDropDown(true)}
          onBlurCapture={() => setShowDropDown(false)}
        >
          {showDropDown ?
            (
              <div className='PlaceInfo__dropdown-container'>
                <ExpandLessIcon
                  className='PlaceInfo__dropdownbtn'
                  onClick={(e) => (handleDropdownClick(e))}
                />
                <UtilityDropDown showDelete={true} setStops={setStops} setZoomLocation={setZoomLocation} stop={stop} stops={stops} setShowDropDown={setShowDropDown} handleAddNotes={handleAddNotes} />
              </div>
            ) :
            (
              <ExpandMoreIcon
                className='PlaceInfo__dropdownbtn PlaceInfo__dropdownbtnop'
                onClick={(e) => (handleDropdownClick(e))}
              />
            )
          }
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <FontAwesomeIcon className='PlaceInfo__img' icon={faMapLocationDot} />
          </div>
          <div className={`ErrorPopUp ${showErr[0] && errMsg ? '' : 'hidden'}`}>
            {errMsg}
          </div>
          <div
            className='PlaceInfo__name PlaceInfo__content'
            onClick={() => handleClick(0)}
          >
            {editMode[0] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input'
                  type='text'
                  value={inputValues.locationName}
                  placeholder='Location Name'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={LNInputRef}
                  name='locationName'
                />
              </form>
            ) : (
              `${inputValues.locationName}`
            )}
          </div>
        </div>
        <div className='PlaceInfo__DateInfo'>
          <div className='PlaceInfo__info'>
            <div className='PlaceInfo__img-container'>
              <TodayIcon className='PlaceInfo__img' />
            </div>
            <div
              className='PlaceInfo__indate PlaceInfo__date PlaceInfo__content'
            >
                {stop.startDate}
            </div>
          </div>
          {/* <div className='PlaceInfo__info'>
            <div className='PlaceInfo__img-container'>
              <EventIcon className='PlaceInfo__img' />
            </div>
            <div className={`ErrorPopUp ${showErr[4] && errMsg ? '' : 'hidden'}`}>
              {errMsg}
            </div> */}
            {/* <div
              className='PlaceInfo__outdate PlaceInfo__date PlaceInfo__content'
              onClick={() => handleClick(4)}
            >
              {editMode[4] ? (
                <form className='PlaceInfo__form'>
                  <input
                    className='PlaceInfo__input PlaceInfo__input-date'
                    type='text'
                    value={inputValues.outDate}
                    placeholder='Check-Out Date'
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    ref={ODInputRef}
                    name="outDate"
                  />
                </form>
              ) : (
                `${inputValues.outDate}`
              )}
            </div> */}
          {/* </div> */}
        </div>
        {/* <div className='PlaceInfo__DistInfo'>
          <div className='PlaceInfo__info'>
            <div className='PlaceInfo__img-container'>
              <FontAwesomeIcon className='PlaceInfo__img' icon={faRoute} />
            </div>
            <div
              className='PlaceInfo__prevdist PlaceInfo__dist PlaceInfo__content'
            >
              {distValues.locationDist}km
            </div>
          </div>
          <div className='PlaceInfo__info'>
            <div className='PlaceInfo__img-container'>
              <HomeIcon className='PlaceInfo__img PlaceInfo__img-distance' />
            </div>
            <div
              className='PlaceInfo__prevdist PlaceInfo__dist PlaceInfo__content'
            >
              {distValues.homeDist}km
            </div>
          </div>
        </div> */}
        <div className={`PlaceInfo__info ${showNotes || inputValues.notesMsg !== '' ? '' : 'hidden'}`}>
          <div className='PlaceInfo__img-container'>
            <EditNoteIcon />
          </div>
          {/* <div
            className='PlaceInfo__notes PlaceInfo__content'
            onClick={() => handleClick(5)}
          >
            {inputValues.desc}
          </div> */}
          <div
            className='PlaceInfo__notes PlaceInfo__content'
            onClick={() => handleClick(5)}
          >
            {editMode[5] ? (
              <form className='PlaceInfo__form'>
                <input
                  className='PlaceInfo__input'
                  type='text'
                  value={inputValues.desc}
                  placeholder='Add notes'
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  ref={NotesInputRef}
                  name="notesMsg"
                />
              </form>
            ) : (
              `${stop.desc}`
            )}
            </div>
        </div>
    </div>
  )
}

const PlaceInfo = ({ distances, stop, stops, setStops, setTotalDistance }: RIPropsType) => {
  return (
      <div>
        <RequestInfo distances={distances} stop={stop} stops={stops} setStops={setStops} setTotalDistance={setTotalDistance} />
      </div>
    )
};

export default PlaceInfo;