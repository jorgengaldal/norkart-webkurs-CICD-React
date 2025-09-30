import { LngLat, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, RPopup, useMap } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

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

  const [crimes, setCrimes] = useState<{ [key: string]: string }[]>([]);

  const crime_emojies = {
    'ASSAULT W/DANGEROUS WEAPON': '🗡️',
    'THEFT/OTHER': '💰',
  };

  useEffect(() => {
    const API =
      'https://opendata.dc.gov/api/download/v1/items/dc3289eab3d2400ea49c154863312434/geojson?layers=8';
    fetch(API)
      .then((res) => res.json())
      .then((res) => {
        setCrimes(res.features.slice(0, 100));
      });
  }, []);
  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={12}
      mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      {crimes.map((feature: { [key: string]: string }) => {
        return (
          <RPopup
            latitude={feature.properties.LATITUDE}
            longitude={feature.properties.LONGITUDE}
          >
            {crime_emojies[feature.properties.OFFENSE]}
          </RPopup>
        );
      })}
      <Overlay>
        <h2>Dette er et overlay</h2>
        <p>Legg til funksjonalitet knyttet til kartet.</p>
        LONG: {clickPoint?.lng}
        <br />
        LONG: {clickPoint?.lat}
      </Overlay>
      <DrawComponent />
    </RMap>
  );
};

function MapFlyTo({ lngLat }: { lngLat: LngLat }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 20, speed: 10 });
  }, [lngLat, map]);

  return null;
}
