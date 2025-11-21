import React from 'react';
import { Coordinates } from '../types';

interface MapVisualizerProps {
  targetLocation?: Coordinates;
  competitorLocation?: Coordinates;
  targetName: string;
  competitorName?: string;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ 
  targetLocation, 
  competitorLocation,
  targetName,
  competitorName 
}) => {
  // Digital Radar Visualization
  // Replaces Google Maps JS API to avoid "InvalidKeyMapError" while maintaining the cyber/audit aesthetic.
  // Calculates relative position of Competitor to Target (Center).
  
  const renderCompetitorDot = () => {
    if (!targetLocation || !competitorLocation) return null;

    const latDiff = competitorLocation.lat - targetLocation.lat;
    const lngDiff = competitorLocation.lng - targetLocation.lng;
    
    // Scale factor: 0.02 degrees ~ 2km. Map this to 40% of container radius.
    const scale = 40 / 0.02; 
    
    let x = 50 + (lngDiff * scale);
    let y = 50 - (latDiff * scale); // Lat increases upwards, screen Y increases downwards

    // Clamp to circle area roughly to keep it inside the radar scope
    const dist = Math.sqrt(Math.pow(x-50, 2) + Math.pow(y-50, 2));
    if (dist > 45) {
        const angle = Math.atan2(y-50, x-50);
        x = 50 + Math.cos(angle) * 45;
        y = 50 + Math.sin(angle) * 45;
    }

    return (
        <div 
            className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] border-2 border-slate-900 flex items-center justify-center group z-10 cursor-help"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            title={competitorName || "Market Leader"}
        >
             <div className="w-full h-full bg-red-500 rounded-full animate-ping opacity-75 absolute"></div>
             
             {/* Tooltip */}
             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-red-500/50 px-2 py-1 rounded text-[10px] text-red-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {competitorName || 'Competitor'}
             </div>
        </div>
    );
  };

  return (
    <div className="w-full h-64 md:h-full min-h-[300px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-inner select-none">
        {/* Radar Grid Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-[90%] aspect-square border border-cyan-500/30 rounded-full"></div>
            <div className="w-[60%] aspect-square border border-cyan-500/30 rounded-full absolute"></div>
            <div className="w-[30%] aspect-square border border-cyan-500/30 rounded-full absolute"></div>
            <div className="w-full h-[1px] bg-cyan-500/30 absolute"></div>
            <div className="h-full w-[1px] bg-cyan-500/30 absolute"></div>
        </div>

        {/* Scanner Sweep Animation */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="w-full h-full origin-center animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-50" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)'}}></div>
        </div>

        {/* Target (You) - Always Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="w-6 h-6 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] border-4 border-slate-900 relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-2 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono uppercase tracking-wider shadow-lg">
                {targetName || 'TARGET'}
            </div>
        </div>

        {/* Competitor Dot */}
        {renderCompetitorDot()}
        
        {/* HUD Text */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-500/70 pointer-events-none">
            <div className="flex items-center gap-1 mb-1">
               <div className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full"></div>
               LIVE TRACKING
            </div>
            SCAN MODE: ACTIVE<br/>
            RANGE: LOCAL (2KM)
        </div>
        
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-slate-600 pointer-events-none text-right">
             GEO-SPATIAL ANALYSIS<br/>
             REL. DISTANCE CALC
        </div>
    </div>
  );
};

export default MapVisualizer;