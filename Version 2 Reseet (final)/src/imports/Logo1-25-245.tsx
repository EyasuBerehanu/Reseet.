import svgPaths from "./svg-qvotna3u3c";

export default function Logo() {
  return (
    <div className="relative size-full" data-name="Logo1">
      <div className="absolute h-[270px] left-0 top-0 w-[347px]" data-name="ReceiptFrame">
        <div className="absolute bottom-[3.35%] left-0 right-0 top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 347 261">
            <path d={svgPaths.p3ea7a300} id="ReceiptFrame" stroke="var(--stroke-0, black)" strokeWidth="22" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['SF_Pro:Bold',sans-serif] font-bold leading-[42.991px] left-[173.5px] text-[0px] text-[88px] text-black text-center text-nowrap top-[65px] tracking-[-3px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Re<span className="text-[#558e00]">see</span>t.
      </p>
      <div className="absolute h-0 left-[32px] top-[157px] w-[90px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-16px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 90 16">
            <line id="Line 1" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="16" x1="8" x2="82" y1="8" y2="8" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[32px] top-[182px] w-[137px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-16px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 137 16">
            <line id="Line 2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="16" x1="8" x2="129" y1="8" y2="8" />
          </svg>
        </div>
      </div>
    </div>
  );
}