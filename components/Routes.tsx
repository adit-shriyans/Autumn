'use client';

import React, { useEffect, FC, useRef, useState, MouseEvent } from 'react';
import L, { Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import { MarkerLocation } from '@assets/types/types';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

interface RPropsType {
    stops: MarkerLocation[];
    setDistances: React.Dispatch<React.SetStateAction<Number[]>>;
    coord: L.LatLngTuple
}

const Routes = ({ stops, setDistances, coord }: RPropsType) => {
    const [routeControls, setRouteControls] = useState<L.Routing.Control[]>([]);

    const map = useMap();

    useEffect(() => {
        if (map) {
            for (let i = 0; i < routeControls.length; i++) {
                if (routeControls[i].getWaypoints()) routeControls[i].spliceWaypoints(0, 2);
            };
            routeControls.forEach((control) => {
                control?.remove();
            });

            setRouteControls([]);

            if (stops.length > 0 && !routeControls[0]?.getWaypoints()[0]?.latLng) {
                const waypoints = [
                    L.latLng(coord[0], coord[1]),
                    L.latLng(stops[0].location[0], stops[0].location[1]),
                ];
                const routeControl = L.Routing.control({
                    waypoints,
                    plan: new L.Routing.Plan(waypoints, {
                        createMarker: function (i, waypoints) {
                            return false;
                        }
                    }),
                    waypointMode: 'snap',
                    routeLine: (route, options) => L.Routing.line(route, {
                        styles: [
                            { color: 'black', opacity: 0, weight: 0 },
                            { color: 'white', opacity: 0, weight: 0 },
                            { color: 'blue', opacity: 0.4, weight: 6 }
                        ],
                        ...options
                    }),
                    addWaypoints: false,
                    routeWhileDragging: false,
                    showAlternatives: false,
                    fitSelectedRoutes: false,
                    containerClassName: 'MapContainer__route'
                });

                routeControl.addTo(map);
                setRouteControls((prev) => [...prev, routeControl]);
            }
            for (let i = 0; i < stops.length - 1; i++) {
                if (!routeControls[i] || routeControls[i]?.getWaypoints()[0]?.latLng === null) {
                    const waypoints = [
                        L.latLng(stops[i].location[0], stops[i].location[1]),
                        L.latLng(stops[i + 1].location[0], stops[i + 1].location[1]),
                    ];
                    const routeControl = L.Routing.control({
                        waypoints,
                        plan: new L.Routing.Plan(waypoints, {
                            createMarker: function (i, waypoints) {
                                return false;
                            }
                        }),
                        waypointMode: 'snap',
                        routeLine: (route, options) => L.Routing.line(route, {
                            styles: [
                                { color: 'black', opacity: 0, weight: 0 },
                                { color: 'white', opacity: 0, weight: 0 },
                                { color: 'blue', opacity: 0.4, weight: 6 }
                            ],
                            ...options
                        }),
                        addWaypoints: false,
                        routeWhileDragging: false,
                        showAlternatives: false,
                        fitSelectedRoutes: false,
                        containerClassName: 'MapContainer__route'
                    });

                    routeControl.addTo(map);
                    setRouteControls((prev) => [...prev, routeControl]);
                }
            }
            document.querySelector('.MapContainer__routes')?.classList.add('hidden');
        }
    }, [stops, map, coord]);

    useEffect(() => {
        const getTotalDistance = (route: { coordinates: any[]; }) => {
            let totalDistance = 0;
            route.coordinates.forEach((coordinate, index) => {
                if (index > 0) {
                    const prevCoordinate = route.coordinates[index - 1];
                    totalDistance += prevCoordinate.distanceTo(coordinate);
                }
            });
            return parseFloat((totalDistance / 1000).toFixed(2));
        };

        routeControls.forEach((control, id) => {
            setDistances([])
            control.on('routesfound', function (e) {
                const routes = e.routes;
                if (routes.length > 0) {
                    const route = routes[0];
                    const distance = getTotalDistance(route);
                    setDistances((prev) => [...prev, distance]);
                }
            });
        });
    }, [routeControls]);

    const mapTopRight = document?.querySelectorAll('.leaflet-right.leaflet-top');
    mapTopRight[0].classList.add('MapContainer__routes')

    return null;
}

export default Routes