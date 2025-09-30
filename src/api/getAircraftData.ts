interface Aircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category: number;
}

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][] | null;
}

const WASHINGTON_DC_BOUNDS = {
  lamin: 38.5,  // Lower latitude bound (covers southern Virginia)
  lamax: 39.5,  // Upper latitude bound (covers northern Maryland)
  lomin: -77.5, // Lower longitude bound (western suburbs)
  lomax: -76.5  // Upper longitude bound (eastern suburbs)
};

export const getAircraftData = async (): Promise<Aircraft[]> => {
  try {
    const url = new URL('https://opensky-network.org/api/states/all');
    url.searchParams.append('lamin', WASHINGTON_DC_BOUNDS.lamin.toString());
    url.searchParams.append('lamax', WASHINGTON_DC_BOUNDS.lamax.toString());
    url.searchParams.append('lomin', WASHINGTON_DC_BOUNDS.lomin.toString());
    url.searchParams.append('lomax', WASHINGTON_DC_BOUNDS.lomax.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenSkyResponse = await response.json();
    
    if (!data.states) {
      return [];
    }

    // Convert the array format to typed objects
    const aircraft: Aircraft[] = data.states
      .filter(state => state[5] !== null && state[6] !== null) // Filter out aircraft without position
      .map(state => ({
        icao24: state[0] as string,
        callsign: state[1] as string | null,
        origin_country: state[2] as string,
        time_position: state[3] as number | null,
        last_contact: state[4] as number,
        longitude: state[5] as number,
        latitude: state[6] as number,
        baro_altitude: state[7] as number | null,
        on_ground: state[8] as boolean,
        velocity: state[9] as number | null,
        true_track: state[10] as number | null,
        vertical_rate: state[11] as number | null,
        sensors: state[12] as number[] | null,
        geo_altitude: state[13] as number | null,
        squawk: state[14] as string | null,
        spi: state[15] as boolean,
        position_source: state[16] as number,
        category: state[17] as number
      }));

    return aircraft;
  } catch (error) {
    console.error('Error fetching aircraft data:', error);
    return [];
  }
};