'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Layers, Search, MapPin, Crosshair, Radio } from 'lucide-react';
import { FOREST_TYPES, FIRE_RISK_LEVELS, PLOT_STATUS } from '@/lib/constants';
import SafeMapLibre from '@/components/map/SafeMapLibre';

const PLOT_DATA = [
  { code: 'DN_BGM_001', name: 'Bu Gia Map Natural Forest', lat: 11.52, lng: 107.35, type: 'natural', risk: 'low', area: 1250.5, species: 'Resin Dipterocarp (Dipterocarpus alatus)', trees: 28500, status: 'active', carbon: 312.6, ndvi: 0.82, lastSurvey: '2025-02-15' },
  { code: 'DN_BGM_002', name: 'Bu Gia Map Plantation', lat: 11.55, lng: 107.38, type: 'planted', risk: 'low', area: 340.2, species: 'Brown Salwood (Acacia mangium)', trees: 85000, status: 'active', carbon: 81.6, ndvi: 0.75, lastSurvey: '2025-02-10' },
  { code: 'DN_BGM_003', name: 'Bu Gia Map Protection Forest', lat: 11.48, lng: 107.30, type: 'protection', risk: 'medium', area: 890.0, species: 'White Meranti (Hopea odorata)', trees: 15000, status: 'active', carbon: 178.0, ndvi: 0.79, lastSurvey: '2025-01-28' },
  { code: 'DN_CAT_001', name: 'Cat Tien National Park', lat: 11.20, lng: 107.15, type: 'natural', risk: 'high', area: 2100.3, species: 'Siamese Sal (Shorea siamensis)', trees: 42000, status: 'degraded', carbon: 420.1, ndvi: 0.58, lastSurvey: '2025-02-20' },
  { code: 'DN_TB_001', name: 'Tam Hiep Mangrove Forest', lat: 10.95, lng: 107.00, type: 'mangrove', risk: 'medium', area: 560.8, species: 'Stilt Mangrove (Rhizophora apiculata)', trees: 120000, status: 'active', carbon: 168.2, ndvi: 0.71, lastSurvey: '2025-02-18' },
  { code: 'BP_BP_001', name: 'Binh Phuoc Natural Forest', lat: 11.80, lng: 106.90, type: 'natural', risk: 'low', area: 1800.0, species: 'Mountain Dipterocarp (Dipterocarpus tuberculatus)', trees: 36000, status: 'active', carbon: 360.0, ndvi: 0.84, lastSurvey: '2025-01-20' },
  { code: 'BP_BP_002', name: 'Binh Phuoc Plantation', lat: 11.85, lng: 106.95, type: 'planted', risk: 'low', area: 420.5, species: 'Timor Mountain Gum (Eucalyptus urophylla)', trees: 105000, status: 'active', carbon: 84.1, ndvi: 0.68, lastSurvey: '2025-01-25' },
  { code: 'DL_YT_001', name: 'Ea Sup Natural Forest', lat: 12.70, lng: 108.10, type: 'natural', risk: 'critical', area: 3200.0, species: 'Resin Dipterocarp (Dipterocarpus alatus)', trees: 64000, status: 'deforested', carbon: 480.0, ndvi: 0.45, lastSurvey: '2025-02-08' },
  { code: 'LD_DL_001', name: 'Lam Dong Protection Forest', lat: 11.95, lng: 108.40, type: 'protection', risk: 'low', area: 950.0, species: 'Fujian Cypress (Fokienia hodginsii)', trees: 19000, status: 'active', carbon: 190.0, ndvi: 0.81, lastSurvey: '2025-02-12' },
  { code: 'CM_CM_001', name: 'Ca Mau Mangrove Forest', lat: 9.20, lng: 105.20, type: 'mangrove', risk: 'high', area: 780.3, species: 'Grey Mangrove (Avicennia marina)', trees: 156000, status: 'active', carbon: 234.1, ndvi: 0.73, lastSurvey: '2025-02-13' },
];

const RISK_COLORS: Record<string, string> = { low: '#52B788', medium: '#FFD600', high: '#FF8A65', critical: '#E65100' };
const TYPE_COLORS: Record<string, string> = { natural: '#2D6A4F', planted: '#52B788', protection: '#40916C', mangrove: '#0277BD' };

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<typeof PLOT_DATA[0] | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [layers, setLayers] = useState({
    fireRisk: true,
    forestType: false,
    boundaries: true,
    ndviOverlay: false,
    rangerPositions: false,
  });

  const onMapReady = useCallback((map: any) => {
    mapRef.current = map;

    const initMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      PLOT_DATA.forEach((plot) => {
        const el = document.createElement('div');
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = RISK_COLORS[plot.risk];
        el.style.border = '3px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        new maplibregl.Marker({ element: el }).setLngLat([plot.lng, plot.lat]).addTo(map);
        el.addEventListener('click', () => {
          setSelectedPlot(plot);
          new maplibregl.Popup({ offset: 25, closeButton: true })
            .setLngLat([plot.lng, plot.lat])
            .setHTML(`<div style="padding:4px"><h3 style="font-size:13px;font-weight:600;margin:0 0 4px 0">${plot.name}</h3><p style="font-size:11px;margin:0;color:#4A6A54">${plot.code}</p><p style="font-size:11px;margin:4px 0 0 0">Area: ${plot.area.toLocaleString()} ha | ${plot.species.split('(')[0]}</p></div>`)
            .addTo(map);
        });
      });

      // Ranger position markers (mock)
      if (layers.rangerPositions) {
        const rangers = [
          { name: 'Ranger Tran', lat: 11.52, lng: 107.36 },
          { name: 'Ranger Pham', lat: 11.21, lng: 107.16 },
          { name: 'Ranger Le', lat: 11.82, lng: 106.92 },
          { name: 'Ranger Vo', lat: 12.68, lng: 108.08 },
        ];
        rangers.forEach(r => {
          const el = document.createElement('div');
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#0277BD';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
          new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).addTo(map);
        });
      }
    };

    initMarkers();

    map.on('mousemove', (e: any) => {
      setCursorCoords({ lat: parseFloat(e.lngLat.lat.toFixed(4)), lng: parseFloat(e.lngLat.lng.toFixed(4)) });
    });
  }, [layers.rangerPositions]);

  const flyToPlot = (plot: typeof PLOT_DATA[0]) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [plot.lng, plot.lat], zoom: 12 });
      setSelectedPlot(plot);
    }
  };

  const filteredPlots = PLOT_DATA.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Forest Map</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive GIS navigation with forest plot boundaries and monitoring layers. Click any plot marker to view
          detailed inventory, carbon stock, and NDVI information. Use layer controls to toggle between fire risk,
          forest type, NDVI overlay, and ranger position views.
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-11rem)]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4 overflow-hidden flex flex-col">
          <Card className="shadow-sm border-0">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search forest plots..." className="pl-8 h-9 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0">
            <CardHeader className="py-2 px-3"><CardTitle className="text-xs font-semibold flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Map Layers</CardTitle></CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between"><Label className="text-xs">Fire Risk</Label><Switch checked={layers.fireRisk} onCheckedChange={(v) => setLayers(l => ({ ...l, fireRisk: v }))} /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Forest Type</Label><Switch checked={layers.forestType} onCheckedChange={(v) => setLayers(l => ({ ...l, forestType: v }))} /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">Boundaries</Label><Switch checked={layers.boundaries} onCheckedChange={(v) => setLayers(l => ({ ...l, boundaries: v }))} /></div>
              <div className="flex items-center justify-between"><Label className="text-xs">NDVI Overlay</Label><Switch checked={layers.ndviOverlay} onCheckedChange={(v) => setLayers(l => ({ ...l, ndviOverlay: v }))} /></div>
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1"><Radio className="w-3 h-3" /> Ranger Positions</Label>
                <Switch checked={layers.rangerPositions} onCheckedChange={(v) => setLayers(l => ({ ...l, rangerPositions: v }))} />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="py-2 px-3"><CardTitle className="text-xs font-semibold">Forest Plots ({filteredPlots.length})</CardTitle></CardHeader>
            <CardContent className="px-2 pb-2 flex-1 overflow-y-auto space-y-1">
              {filteredPlots.map(plot => (
                <button key={plot.code} onClick={() => flyToPlot(plot)} className={`w-full text-left p-2 rounded-lg text-xs transition-colors hover:bg-muted/80 ${selectedPlot?.code === plot.code ? 'bg-muted' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: RISK_COLORS[plot.risk] }} />
                    <span className="font-medium truncate">{plot.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-5">
                    <span className="text-muted-foreground">{plot.code}</span>
                    <span className="text-muted-foreground">{plot.area.toLocaleString()} ha</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="flex-1 flex flex-col gap-2">
          <SafeMapLibre onMapReady={onMapReady} className="flex-1 rounded-xl overflow-hidden border border-border" />
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 rounded-lg text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Crosshair className="w-3 h-3" />
              {cursorCoords
                ? <span className="font-mono">{cursorCoords.lat}°N, {cursorCoords.lng}°E</span>
                : <span className="font-mono">Hover map to see coordinates</span>
              }
            </span>
            <div className="flex items-center gap-3">
              {FIRE_RISK_LEVELS.map(level => (
                <div key={level.value} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }} />
                  <span className="text-[10px] text-muted-foreground">{level.label}</span>
                </div>
              ))}
              {layers.rangerPositions && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0277BD' }} />
                  <span className="text-[10px] text-muted-foreground">Ranger</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedPlot && (
          <div className="w-72 flex-shrink-0">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{selectedPlot.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Plot Code:</span><br /><span className="font-mono">{selectedPlot.code}</span></div>
                  <div><span className="text-muted-foreground">Forest Type:</span><br /><Badge variant="outline" style={{ color: TYPE_COLORS[selectedPlot.type], borderColor: TYPE_COLORS[selectedPlot.type] }}>{FOREST_TYPES.find(f => f.value === selectedPlot.type)?.label}</Badge></div>
                  <div><span className="text-muted-foreground">Area:</span><br />{selectedPlot.area.toLocaleString()} ha</div>
                  <div><span className="text-muted-foreground">Tree Count:</span><br />{selectedPlot.trees.toLocaleString()}</div>
                  <div><span className="text-muted-foreground">Dominant Species:</span><br />{selectedPlot.species.split('(')[0].trim()}</div>
                  <div><span className="text-muted-foreground">Fire Risk:</span><br /><Badge style={{ backgroundColor: RISK_COLORS[selectedPlot.risk], color: 'white' }}>{FIRE_RISK_LEVELS.find(f => f.value === selectedPlot.risk)?.label}</Badge></div>
                  <div><span className="text-muted-foreground">Carbon Stock:</span><br />{selectedPlot.carbon.toLocaleString()} tCO2e</div>
                  <div><span className="text-muted-foreground">NDVI:</span><br />{selectedPlot.ndvi}</div>
                </div>
                <Separator />
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{PLOT_STATUS.find(s => s.value === selectedPlot.status)?.label}</Badge></div>
                <div><span className="text-muted-foreground">Last Survey:</span> {selectedPlot.lastSurvey}</div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedPlot(null)}>Close</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
