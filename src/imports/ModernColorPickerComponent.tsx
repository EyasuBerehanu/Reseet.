function SlotClone() {
  return (
    <div className="bg-blue-500 relative rounded-[8px] shrink-0 size-[32px]" data-name="SlotClone">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[32px]" />
    </div>
  );
}

function Code() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[10px] shrink-0 w-[93.008px]" data-name="Code">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[93.008px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[17px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[9.5px] whitespace-pre">#3b82f6</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="bg-gray-50 content-stretch flex flex-col gap-[16px] h-[86px] items-center relative shrink-0 w-full" data-name="App">
      <SlotClone />
      <Code />
    </div>
  );
}

export default function ModernColorPickerComponent() {
  return (
    <div className="bg-white relative size-full" data-name="Modern Color Picker Component">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-0 pl-[500.492px] pr-[500.5px] pt-[329.5px] relative size-full">
          <App />
        </div>
      </div>
    </div>
  );
}