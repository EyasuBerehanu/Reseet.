import svgPaths from "./svg-tz509ybxi8";

export default function Logo() {
  return (
    <div className="relative size-full" data-name="Logo1">
      <div className="absolute h-[125.937px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[161.853px]" data-name="ReceiptFrame">
        <div className="absolute inset-[-3.18%_-2.47%_0.29%_-2.47%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 170 130">
            <path d={svgPaths.p8ff5c00} fill="var(--fill-0, white)" id="ReceiptFrame" stroke="var(--stroke-0, black)" strokeWidth="8" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['SF_Pro:Bold',sans-serif] font-bold leading-[20.052px] left-1/2 text-[41.046px] text-black text-center text-nowrap top-[calc(50%-32.65px)] tracking-[-1.3993px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Re<span className="text-[#558e00]">see</span>t.
      </p>
      <div className="absolute h-0 left-[calc(50%-45.01px)] top-[calc(50%+10.26px)] translate-x-[-50%] translate-y-[-50%] w-[41.979px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-8px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 8">
            <line id="Line 1" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="8" x1="4" x2="37.979" y1="4" y2="4" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[calc(50%-34.05px)] top-[calc(50%+21.92px)] translate-x-[-50%] translate-y-[-50%] w-[63.901px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-8px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 8">
            <line id="Line 2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="8" x1="4" x2="59.9014" y1="4" y2="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}