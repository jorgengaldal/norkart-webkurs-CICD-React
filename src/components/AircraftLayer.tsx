import { useEffect, useState } from 'react';
import { useMap } from 'maplibre-react-components';
import { getAircraftData } from '../api/getAircraftData';
import { Popup } from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';

interface Aircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
}

const AircraftLayer = () => {
  const map = useMap();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAircraftData = async () => {
    setIsLoading(true);
    try {
      const data = await getAircraftData();
      setAircraft(data);
    } catch (error) {
      console.error('Failed to fetch aircraft data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAircraftData();
    
    // Set up interval to refresh data every 10 seconds
    const interval = setInterval(fetchAircraftData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!map) return;

    // Wait for map to be loaded
    const addAircraftLayer = () => {
      // Create GeoJSON data from aircraft (filter out planes without coordinates)
      const geojsonData = {
        type: 'FeatureCollection',
        features: aircraft
          .filter(plane => plane.longitude !== null && plane.latitude !== null)
          .map(plane => ({
            type: 'Feature',
            properties: {
              icao24: plane.icao24,
              callsign: plane.callsign || 'Unknown',
              origin_country: plane.origin_country,
              altitude: plane.baro_altitude,
              on_ground: plane.on_ground,
              velocity: plane.velocity,
              heading: plane.true_track
            },
            geometry: {
              type: 'Point',
              coordinates: [plane.longitude!, plane.latitude!]
            }
          }))
      };

      // Add or update the data source
      if (map.getSource('aircraft')) {
        (map.getSource('aircraft') as GeoJSONSource).setData(geojsonData as any);
      } else {
        map.addSource('aircraft', {
          type: 'geojson',
          data: geojsonData as any
        });

        // Add aircraft icons layer
        map.addLayer({
          id: 'aircraft-icons',
          type: 'symbol',
          source: 'aircraft',
          layout: {
            'icon-image': 'aircraft-icon',
            'icon-size': 0.8,
            'icon-rotation-alignment': 'map',
            'icon-rotate': ['case', 
              ['!=', ['get', 'heading'], null], 
              ['get', 'heading'], 
              0
            ],
            'icon-allow-overlap': true,
            'text-field': ['get', 'callsign'],
            'text-font': ['Open Sans Regular'],
            'text-offset': [0, 2],
            'text-anchor': 'top',
            'text-size': 12
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 1
          }
        });

        // Add popup on click
        map.on('click', 'aircraft-icons', (e) => {
          if (e.features && e.features[0]) {
            const properties = e.features[0].properties;
            const coordinates = (e.features[0].geometry as any).coordinates.slice();

            const altitude = properties?.altitude ? `${Math.round(properties.altitude)} m` : 'Unknown';
            const velocity = properties?.velocity ? `${Math.round(properties.velocity * 3.6)} km/h` : 'Unknown';
            
            new Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div style="font-family: Arial, sans-serif; padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
                    ${properties?.callsign || 'Unknown Flight'}
                  </h3>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Country:</strong> ${properties?.origin_country}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Altitude:</strong> ${altitude}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Speed:</strong> ${velocity}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${properties?.on_ground ? 'On Ground' : 'In Flight'}</p>
                </div>
              `)
              .addTo(map);
          }
        });

        // Change cursor on hover
        map.on('mouseenter', 'aircraft-icons', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'aircraft-icons', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    // Add a simple aircraft icon using a Unicode airplane symbol
    if (!map.hasImage('aircraft-icon')) {
      // Create a canvas for the aircraft icon
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Draw a simple airplane shape
      ctx.fillStyle = '#ff0000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✈', size / 2, size / 2);
      
      map.addImage('aircraft-icon', {
        width: size,
        height: size,
        data: ctx.getImageData(0, 0, size, size).data
      });
    }

    if (map.isStyleLoaded()) {
      addAircraftLayer();
    } else {
      map.on('styledata', addAircraftLayer);
    }

  }, [map, aircraft]);

  return null;
};

export default AircraftLayer;