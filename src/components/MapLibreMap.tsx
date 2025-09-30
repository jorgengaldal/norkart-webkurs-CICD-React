import { LngLat, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, useMap } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import AircraftLayer from './AircraftLayer';
import AircraftStatus from './AircraftStatus';

const WASHINGTON_DC_COORDS: [number, number] = [-77.0369, 38.9072];

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);

  useEffect(() => {
    console.log(pointHoyde, clickPoint);
  }, [clickPoint, pointHoyde]);

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const hoyder = await getHoydeFromPunkt(e.lngLat.lng, e.lngLat.lat);
    setPointHoydeAtPunkt(hoyder[0].Z);
    setClickPoint(new LngLat(e.lngLat.lng, e.lngLat.lat));
  };

  return (
    <div style={{ position: 'relative' }}>
      <RMap
        minZoom={6}
        initialCenter={WASHINGTON_DC_COORDS}
        initialZoom={12}
        mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
        style={{
          height: `calc(100dvh - var(--header-height))`,
        }}
        onClick={onMapClick}
      >
        <Overlay>
          <h2>Live Aircraft Around Washington DC</h2>
          <p>Click on aircraft markers to see flight details. Data updates every 10 seconds.</p>
        </Overlay>
        <DrawComponent />
        <AircraftLayer />
      </RMap>
      <AircraftStatus />
    </div>
  );
};

function MapFlyTo({ lngLat }: { lngLat: LngLat }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 20, speed: 10 });
  }, [lngLat, map]);

  return null;
}
