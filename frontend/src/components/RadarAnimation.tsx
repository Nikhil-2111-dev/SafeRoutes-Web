import React from 'react';

export default function RadarAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Base Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px', backgroundPosition: 'center center' }}></div>
      
      {/* Radar Container */}
      <div className="relative w-[150vw] h-[150vw] sm:w-[800px] sm:h-[800px] flex items-center justify-center">
        {/* Concentric Circles */}
        <div className="absolute w-full h-full border border-white/5 rounded-full"></div>
        <div className="absolute w-[75%] h-[75%] border border-white/10 rounded-full border-dashed"></div>
        <div className="absolute w-[50%] h-[50%] border border-white/15 rounded-full"></div>
        <div className="absolute w-[25%] h-[25%] border border-white/20 rounded-full border-dashed"></div>
        
        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-white/10"></div>
        <div className="absolute w-[1px] h-full bg-white/10"></div>
        
        {/* Central Dot */}
        <div className="absolute w-6 h-6 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#ffffff]"></div>
        </div>

        {/* The Sweeping Radar Beam */}
        <div 
          className="absolute w-full h-full rounded-full animate-[spin_4s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(255, 255, 255, 0.05) 90%, rgba(255, 255, 255, 0.3) 100%)',
            borderRadius: '50%'
          }}
        ></div>

        {/* Blips / Entities */}
        <div className="absolute top-[20%] left-[30%] w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#ffffff] animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[35%] right-[25%] w-4 h-4 rounded-full bg-zinc-300 shadow-[0_0_15px_#d4d4d8] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-zinc-400 shadow-[0_0_15px_#a1a1aa] animate-pulse"></div>
      </div>
    </div>
  );
}
