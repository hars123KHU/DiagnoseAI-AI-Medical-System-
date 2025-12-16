"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2 } from "lucide-react"
import axios from "axios"
import SuggestedDoctorCard from "./SuggestedDoctorCard"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { SessionDetail } from "../medical-agent/[sessionId]/page"
import { doctorAgent } from "./DoctorAgentCard"

function AddNewSessionDialog() {
  // 🧠 STATE
  const [note, setNote] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[] | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent | null>(null)
  const [historyList, setHistoryList] = useState<SessionDetail[]>([])

  const router = useRouter()
  const { has } = useAuth()

  // @ts-ignore – Clerk custom plan
  const paidUser = has && has({ plan: "pro" })

  // 📥 FETCH HISTORY
  useEffect(() => {
    getHistoryList()
  }, [])

  const getHistoryList = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all")
      setHistoryList(result.data)
    } catch (error) {
      console.error("History fetch failed:", error)
    }
  }

  // ➡️ STEP 1: GET DOCTOR SUGGESTIONS
  const onClickNext = async () => {
    if (!note) return
    setLoading(true)

    try {
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      })

      // Normalize ID (handles id / _id / fallback)
      const normalizedDoctors = result.data.map(
        (doctor: doctorAgent, index: number) => ({
          ...doctor,
          id: doctor.id || (doctor as any)._id || String(index),
        })
      )
        setSuggestedDoctors(result.data);
        setLoading(false);

    } catch (error) {
      console.error("Doctor suggestion failed:", error)
    } finally {
      setLoading(false)
    }
  }

  // 🩺 STEP 2: START CONSULTATION
  const onStartConsultation = async () => {
    if (!selectedDoctor) return
    setLoading(true)

    try {
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor,
      })

      if (result.data?.sessionId) {
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`)
      }
    } catch (error) {
      console.error("Session creation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      {/* 🔘 TRIGGER */}
      <DialogTrigger asChild>
        <Button className="mt-3">
            + Start a Consultation
         </Button>
      </DialogTrigger>


      {/* 📦 DIALOG */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
        </DialogHeader>

        {/* ❗ FIX: NO asChild HERE */}
        <DialogDescription>
          {!suggestedDoctors ? (
            // 🧾 STEP 1 UI
            <div>
              <h2 className="font-semibold mb-2">
                Add Symptoms or Any Other Details
              </h2>
              <Textarea
                placeholder="Describe your symptoms..."
                className="h-[200px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          ) : (
            // 🩺 STEP 2 UI
            <div>
              <h2 className="font-semibold mb-3">Select the doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {suggestedDoctors.map((doctor) => (
                  <SuggestedDoctorCard
                    key={doctor.id}
                    doctorAgent={doctor}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={setSelectedDoctor}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogDescription>

        {/* 🦶 FOOTER */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button disabled={!note || loading} onClick={onClickNext}>
              Next
              {loading ? (
                <Loader2 className="ml-2 animate-spin" />
              ) : (
                <ArrowRight className="ml-2" />
              )}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={onStartConsultation}
            >
              Start Consultation
              {loading ? (
                <Loader2 className="ml-2 animate-spin" />
              ) : (
                <ArrowRight className="ml-2" />
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewSessionDialog
