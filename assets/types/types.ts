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
    type: string,
    status: string,
    startDate?: string,
    desc?: string,
    notes?: string,
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
    id: string;
    location: [number, number];
    locationName: string;
    notes: string;
    desc: string;
    startDate: string | null;
    status: string;
    user: {
      _id: string;
      email: string;
      username: string;
      image: string;
      __v: number;
    };
    __v: number;
    _id: string;
    type: string;
  }

export type VoidFunctionType = () => void;

