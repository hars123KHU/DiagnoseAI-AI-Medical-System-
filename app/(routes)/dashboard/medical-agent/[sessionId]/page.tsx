"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
    setSessionDetail(result.data);
  };

  /**
   * ✅ Ask mic permission BEFORE starting call
   */
  const ensureMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      toast.error("Microphone permission is required");
      return false;
    }
  };

  /**
   * ✅ START CALL (FIXED VERSION)
   */
  const StartCall = async () => {
    if (!sessionDetail) return;

    const micOk = await ensureMicPermission();
    if (!micOk) return;

    setLoading(true);

    try {
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      setVapiInstance(vapi);

      /**
       * ✅ Use ASSISTANT ID instead of manual config
       * This prevents Daily room disconnect issue
       */
      await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID!
      );

      /**
       * EVENT LISTENERS
       */
      vapi.on("call-start", () => {
        setLoading(false);
        setCallStarted(true);
        console.log("✅ Call started");
      });

      vapi.on("call-end", () => {
        console.log("❌ Call ended");
        setCallStarted(false);
        setVapiInstance(null);
      });

      vapi.on("error", (e: any) => {
        console.error("🚨 VAPI ERROR:", e);
        toast.error("Voice connection failed");
        setLoading(false);
      });

      vapi.on("message", (message: any) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;

          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          }

          if (transcriptType === "final") {
            setMessages((prev) => [
              ...prev,
              { role, text: transcript },
            ]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });

      vapi.on("speech-start", () => {
        setCurrentRole("assistant");
      });

      vapi.on("speech-end", () => {
        setCurrentRole("user");
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start call");
      setLoading(false);
    }
  };

  /**
   * END CALL
   */
  const endCall = async () => {
    const result = await GenerateReport();

    if (!vapiInstance) return;

    vapiInstance.stop();
    vapiInstance.removeAllListeners();

    setCallStarted(false);
    setVapiInstance(null);

    toast.success("Your report is generated!");
    router.replace("/dashboard");
  };

  /**
   * GENERATE REPORT
   */
  const GenerateReport = async () => {
    setLoading(true);

    const result = await axios.post("/api/medical-report", {
      messages,
      sessionDetail,
      sessionId,
    });

    setLoading(false);
    return result.data;
  };

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      {/* STATUS */}
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle
            className={`h-4 w-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected..." : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>

      {/* MAIN UI */}
      {sessionDetail && (
        <div className="flex items-center flex-col mt-10">
          <Image
            src={sessionDetail.selectedDoctor?.image}
            alt={sessionDetail.selectedDoctor?.specialist ?? ""}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />

          <h2 className="mt-2 text-lg">
            {sessionDetail.selectedDoctor?.specialist}
          </h2>
          <p className="text-sm text-gray-400">
            AI Medical Voice Agent
          </p>

          {/* TRANSCRIPTS */}
          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72">
            {messages.slice(-4).map((msg, index) => (
              <h2 className="text-gray-400 p-2" key={index}>
                {msg.role}: {msg.text}
              </h2>
            ))}

            {liveTranscript && (
              <h2 className="text-lg">
                {currentRole} : {liveTranscript}
              </h2>
            )}
          </div>

          {/* BUTTONS */}
          {!callStarted ? (
            <Button
              className="mt-20"
              onClick={StartCall}
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <PhoneCall />
              )}
              Start Call
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={endCall}
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <PhoneOff />
              )}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;