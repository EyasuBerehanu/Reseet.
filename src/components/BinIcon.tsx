import React from 'react';
import svgPaths from "../imports/svg-bw5xn1n86b";

interface BinIconProps {
  className?: string;
  fillColor?: string;
  strokeColor?: string;
}

export function BinIcon({ 
  className = "", 
  fillColor = "white", 
  strokeColor = "black" 
}: BinIconProps) {
  return (
    <div className={`relative ${className}`}>
      <svg 
        className="block size-full" 
        fill="none" 
        preserveAspectRatio="none" 
        viewBox="0 0 89 74"
        style={{
          ['--fill-0' as any]: fillColor,
          ['--stroke-0' as any]: strokeColor,
        }}
      >
        <g clipPath="url(#clip0_45_315)">
          {/* Back rectangle - the bin container back */}
          <path 
            d={svgPaths.p199bd700} 
            fill="var(--fill-0, white)" 
            stroke="var(--stroke-0, black)" 
            strokeWidth="4" 
          />
          
          {/* Files/papers - these lines represent papers in the bin */}
          <path 
            d={svgPaths.p20a1c2c0} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          <path 
            d={svgPaths.p165c4fa0} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          <path 
            d={svgPaths.p2f3ae420} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          <path 
            d={svgPaths.pbf0fc00} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          <path 
            d={svgPaths.p314a4f00} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          <path 
            d={svgPaths.pa099a00} 
            stroke="var(--stroke-0, black)" 
            strokeLinecap="round" 
            strokeWidth="4" 
          />
          
          {/* Front rectangle - the bin container front (on top) */}
          <path 
            d={svgPaths.p3c5c2ec0} 
            fill="var(--fill-0, white)" 
            stroke="var(--stroke-0, black)" 
            strokeWidth="4" 
          />
        </g>
        <defs>
          <clipPath id="clip0_45_315">
            <rect fill="white" height="73.1321" width="88.7023" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
