import svgPaths from "./svg-opbg76j86n";

function Component({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Component 1">
      <div className="absolute inset-[28.9%_50.94%_71.1%_17.19%]">
        <div className="absolute bottom-0 left-0 right-0 top-[-16px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 102 16">
            <line id="Line 2" stroke="var(--stroke-0, #558E00)" strokeLinecap="round" strokeWidth="16" x1="8" x2="94" y1="8" y2="8" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[32.79%] left-[9.69%] right-[9.38%] top-0" data-name="ReceiptFrame">
        <div className="absolute bottom-[3.92%] left-0 right-0 top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 259 199">
            <path d={svgPaths.p3949d200} id="ReceiptFrame" stroke="var(--stroke-0, #558E00)" strokeWidth="22" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.99%_34.38%_62.01%_17.19%]">
        <div className="absolute bottom-0 left-0 right-0 top-[-16px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 155 16">
            <line id="Line 3" stroke="var(--stroke-0, #558E00)" strokeLinecap="round" strokeWidth="16" x1="8" x2="147" y1="8" y2="8" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-[26.62%]">
        <div className="absolute bottom-0 left-0 right-0 top-[3.34%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 320 219">
            <path d={svgPaths.p2de9e200} fill="var(--fill-0, black)" id="Rectangle 2" />
          </svg>
        </div>
      </div>
      <div className="absolute bg-white inset-[76.95%_26.88%_13.31%_26.88%] rounded-[30px]" />
    </div>
  );
}

export default function Component1() {
  return <Component className="relative size-full" />;
}