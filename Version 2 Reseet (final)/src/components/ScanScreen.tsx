import React from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './ui/button';

interface ScanScreenProps {
  onBack: () => void;
}

export function ScanScreen({ onBack }: ScanScreenProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Camera Frame */}
      <div className="flex-1 relative">
        {/* Close button */}
        <button onClick={onBack} className="absolute top-12 right-4 z-10 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Camera viewfinder simulation */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-[3/4] border-2 border-white/50 rounded-3xl">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-3xl" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6">
                <Camera className="w-12 h-12 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Helper text overlay */}
        <div className="absolute top-1/4 left-0 right-0 text-center px-8">
          <p className="text-white/90 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
            Position receipt within frame
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-8 pb-12 pt-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-center text-white/80">
            We'll turn this into a clean digital receipt and estimate tax write-off likelihood
          </p>
          
          <Button 
            className="w-full rounded-full py-7"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scan Receipt
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full rounded-full py-7 text-white hover:bg-white/10"
          >
            Choose from Library
          </Button>
        </div>
      </div>
    </div>
  );
}
