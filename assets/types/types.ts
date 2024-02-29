export type TripType = {
    _id: string;
    name: String;
    stops: MarkerLocation[];
    status: StatusType; 
}

export type MarkerLocation = {
    id: string,
    location: L.LatLngTuple,
    locationName: string,
    startDate?: string,
    endDate?: string,
    notes?: string
}

export type searchResultType = {
  x: number;
  y: number;
  label: string;
  bounds: [
      [number, number],
      [number, number],
  ];
  raw: Record<string, any>;
};


export type StatusType = {
    status: "completed" | "ongoing" | "upcoming"; 
}

export interface StopResponseType {
    endDate: string | null;
    id: string;
    location: [number, number];
    locationName: string;
    notes: string;
    startDate: string | null;
    trip: {
      _id: string;
      user: string;
      id: string;
      status: string;
      __v: number;
    };
    __v: number;
    _id: string;
  }

export type VoidFunctionType = () => void;

