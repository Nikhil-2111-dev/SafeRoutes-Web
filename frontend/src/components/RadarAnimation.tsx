import React from 'react';

export default function RadarAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Base Grid */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#00F2FE 1px, transparent 1px), linear-gradient(90deg, #00F2FE 1px, transparent 1px)', backgroundSize: '50px 50px', backgroundPosition: 'center center' }}></div>
      
      {/* Radar Container */}
      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        {/* Concentric Circles */}
        <div className="absolute w-full h-full border border-[#00F2FE]/10 rounded-full"></div>
        <div className="absolute w-[450px] h-[450px] border border-[#00F2FE]/15 rounded-full border-dashed"></div>
        <div className="absolute w-[300px] h-[300px] border border-[#00F2FE]/20 rounded-full"></div>
        <div className="absolute w-[150px] h-[150px] border border-[#00F2FE]/30 rounded-full border-dashed"></div>
        
        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#00F2FE]/20"></div>
        <div className="absolute w-[1px] h-full bg-[#00F2FE]/20"></div>
        
        {/* Central Dot */}
        <div className="absolute w-6 h-6 bg-[#00F2FE]/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-[#00F2FE] rounded-full shadow-[0_0_10px_#00F2FE]"></div>
        </div>

        {/* The Sweeping Radar Beam */}
        <div 
          className="absolute w-full h-full rounded-full animate-[spin_4s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 242, 254, 0.05) 90%, rgba(0, 242, 254, 0.4) 100%)',
            borderRadius: '50%'
          }}
        ></div>

        {/* Blips / Entities */}
        <div className="absolute top-[20%] left-[30%] w-3 h-3 rounded-full bg-[#00F2FE] shadow-[0_0_15px_#00F2FE] animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[35%] right-[25%] w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_blue] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-[#FF2A5F] shadow-[0_0_15px_#FF2A5F] animate-pulse"></div>
      </div>
    </div>
  );
}
