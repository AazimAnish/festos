"use client"

import Gravity, { MatterBody } from "@/fancy/components/physics/gravity"

export default function Preview() {
  return (
    <div className="w-dvw h-dvh flex flex-col relative font-azeret-mono bg-black">
      <div className="pt-20 text-6xl sm:text-7xl md:text-8xl text-white w-full text-center font-calendas italic text-glow">
        Festos
      </div>
      <p className="pt-4 text-base sm:text-xl md:text-2xl text-white/80 w-full text-center">
        unforgettable experiences, one ticket at a time
      </p>
      <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#ff7e78] text-white rounded-full hover:cursor-pointer px-8 py-4 card-glass accent-glow">
            music
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="30%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#e794da] text-white rounded-full hover:cursor-grab px-8 py-4 card-glass">
            festivals
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="40%"
          y="20%"
          angle={10}
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#1f464d] text-white rounded-full hover:cursor-grab px-8 py-4 card-glass">
            tech
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="75%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#ff5941] text-white rounded-full hover:cursor-grab px-8 py-4 card-glass">
            concerts
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="80%"
          y="20%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#f97316] text-white rounded-full hover:cursor-grab px-8 py-4 card-glass">
            food
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="50%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#ffd726] text-white rounded-full hover:cursor-grab px-8 py-4 card-glass">
            arts
          </div>
        </MatterBody>
      </Gravity>
    </div>
  )
} 