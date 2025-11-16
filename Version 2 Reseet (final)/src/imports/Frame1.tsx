import svgPaths from "./svg-f7gh5tqugp";

function Group() {
  return (
    <div className="h-[53.667px] relative shrink-0 w-[40.25px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 54">
        <g id="Group 9">
          <path d={svgPaths.p202f3700} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p5c44100} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p23c3aa70} fill="var(--fill-0, black)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white content-stretch flex items-center relative size-full">
      <Group />
    </div>
  );
}