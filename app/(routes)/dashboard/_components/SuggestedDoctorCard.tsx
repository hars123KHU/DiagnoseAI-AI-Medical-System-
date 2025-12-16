import React from "react"
import { doctorAgent } from "./DoctorAgentCard"
import Image from "next/image"

type Props = {
  doctorAgent: doctorAgent
  setSelectedDoctor: (doctor: doctorAgent) => void
  selectedDoctor: doctorAgent | null   // ✅ FIXED
}

function SuggestedDoctorCard({
  doctorAgent,
  setSelectedDoctor,
  selectedDoctor,
}: Props) {
  const isSelected = selectedDoctor?.id === doctorAgent.id

  return (
    <div
      onClick={() => setSelectedDoctor(doctorAgent)} // ✅ works correctly
      className={`flex flex-col items-center
        border rounded-2xl shadow p-5 cursor-pointer
        hover:border-blue-500 transition
        ${isSelected ? "border-blue-500" : ""}`}
    >
      {/* 👤 Doctor image */}
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={70}
        height={70}
        className="w-[50px] h-[50px] rounded-full object-cover"
      />

      {/* 🩺 Doctor name */}
      <h2 className="font-bold text-sm text-center mt-2">
        {doctorAgent.specialist}
      </h2>

      {/* 📝 Description */}
      <p className="text-xs text-center line-clamp-2 mt-1">
        {doctorAgent.description}
      </p>
    </div>
  )
}

export default SuggestedDoctorCard
