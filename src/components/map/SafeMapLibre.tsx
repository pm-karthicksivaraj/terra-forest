'use client';

import React, { useEffect, useRef } from 'react';

/**
 * SafeMapLibre — Prevents React's "removeChild" DOM conflict with MapLibre GL JS.
 *
 * MapLibre creates/removes DOM nodes (popups, markers, controls) that
 * React's reconciler doesn't know about. When React tries to unmount,
 * it fails with: "Failed to execute 'removeChild' on 'Node'".
 *
 * Fix: Mount MapLibre into a container React NEVER touches after initial render.
 */
interface SafeMapLibreProps {
  onMapReady: (map: any) => void;
  style?: React.CSSProperties;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export default function SafeMapLibre({
  onMapReady,
  style,
  className,
  center = [107.35, 11.05],
  zoom = 7,
}: SafeMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let destroyed = false;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      if (destroyed || !container) return;

      const map = new maplibregl.Map({
        container,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center,
        zoom,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.on('load', () => {
        if (!destroyed) {
          mapRef.current = map;
          onMapReadyRef.current(map);
        }
      });
    };

    initMap();

    return () => {
      destroyed = true;
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch {
        // Silently ignore DOM errors during cleanup
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      suppressHydrationWarning
    />
  );
}
