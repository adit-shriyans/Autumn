'use client';

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faRoute } from '@fortawesome/free-solid-svg-icons'
import TodayIcon from '@mui/icons-material/Today';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditNoteIcon from '@mui/icons-material/EditNote';
import UtilityDropDown from './UtilityDropDown';
import { MarkerLocation, RescuerInfo } from '@assets/types/types';
import { calculateDistance, getTodaysDate, isValidDate } from '@assets/CalcFunctions';
// import '@styles/css/PlaceInfo.css';

interface RIPropsType {
  stop: RescuerInfo;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>
}

const arraySize = 6;

const RescInfo = ({ stop, setZoomLocation }: RIPropsType) => {
  return (
    <div
      className='PlaceInfo'
      onClick={() => { setZoomLocation(stop.location) }}
    >
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <FontAwesomeIcon className='PlaceInfo__img' icon={faMapLocationDot} />
          </div>
          <div
            className='PlaceInfo__name PlaceInfo__content'
          >
            {stop.locationName}
          </div>
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <LocalPoliceIcon className='PlaceInfo__img' />
          </div>
          <div
            className='PlaceInfo__name PlaceInfo__content'
          >
            {stop.dept}
          </div>
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <LocalPhoneIcon className='PlaceInfo__img' />
          </div>
          <div
            className='PlaceInfo__name PlaceInfo__content'
          >
            {stop.no}
          </div>
        </div>
        <div className='PlaceInfo__info'>
          <div className='PlaceInfo__img-container'>
            <EmailIcon className='PlaceInfo__img' />
          </div>
          <div
            className='PlaceInfo__name PlaceInfo__content'
          >
            {stop.email}
          </div>
        </div>
    </div>
  )
}

export default RescInfo;