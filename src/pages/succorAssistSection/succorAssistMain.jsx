"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const bodyParts = [
  "head", "leftArm", "leftHand", "chest", "stomach", "rightArm", "rightHand",
  "leftLeg", "leftFoot", "rightLeg", "rightFoot"
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case "severe":
      return "bg-red-500";
    case "moderate":
      return "bg-orange-400";
    case "minor":
      return "bg-yellow-300";
    case "unaffected":
      return "bg-green-400";
    default:
      return "bg-gray-200";
  }
};

export default function SuccorAssistMain() {
    const [accidentData, setAccidentData] = useState([]);
    const [transcript, setTranscript] = useState("");
    const [injuryMap, setInjuryMap] = useState({});
    const recognitionRef = useRef(null);
    const isRecognizingRef = useRef(false);

    useEffect(() => {
        fetch("/data/accidentsData.json")
        .then((res) => res.json())
        .then((data) => setAccidentData(data))
        .catch((error) => console.log("Loading Accidents Data Error:", error));
    }, []);

    const processTranscript = (text) => {
        const cleanedData = text.toLowerCase();
        const cleanedTranscript = transcript.toLowerCase();

        const matchedDataParsed = dataMatcher(data)


    };

    function dataMatcher(data) {
        if(!accidentData.length) return;

        const matchedData = accidentData.find(accident => 
            accident.keywords && accident.keywords.some(keywords =>
                keyword && data.toLowerCase().includes(keyword.toLowerCase())
            )
        )

        return matchedData || null
    }


    const startRecognition = () => {
        if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        setTranscript("Speech Recognition is not supported in your browser.");
        return;
        }

        const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
        isRecognizingRef.current = true;
        setTranscript("Recording... Please speak into the microphone.");
        };

        recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(`Recorded: "${result}"`);
        processTranscript(result);
        };

        recognition.onerror = (event) => {
        setTranscript(`Error: ${event.error}`);
        };

        recognition.onend = () => {
        isRecognizingRef.current = false;
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopRecognition = () => {
        if (recognitionRef.current && isRecognizingRef.current) {
        recognitionRef.current.stop();
        isRecognizingRef.current = false;
        setTranscript("Recording stopped.");
        }
    };

  return (
        <div className="w-full h-screen p-0 flex lg:flex-row md:flex-row sm:flex-col gap-4 items-center justify-center">
        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="left">
            <div className="w-full h-1/2 border border-amber-50"></div>
            <div className="w-full h-1/2 border border-amber-50 flex flex-col gap-2 items-center justify-center">
                <Button onClick={startRecognition}>Start</Button>
                <Button onClick={stopRecognition}>Stop</Button>
            <p className="text-amber-200 text-sm text-center px-2">{transcript}</p>
            </div>
        </div>

        <div className="w-full h-full flex lg:flex-row sm:flex-col gap-4 p-4 items-center justify-between border border-amber-50">
            <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full h-full flex flex-col p-2 items-center justify-center border border-amber-50" id="center">
                <div className={`h-[50px] w-[50px]  border border-black ${getSeverityColor(injuryMap.head)}`} id="head"></div>
                <div className="flex flex-row">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftArm)}`} id="leftArm"></div>
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftHand)}`} id="leftHand"></div>
                </div>
                <div className="flex flex-col" id="body">
                    <div className={`h-[50px] w-[100px] border border-black ${getSeverityColor(injuryMap.chest)}`} id="chest"></div>
                    <div className={`h-[50px] w-[100px] border border-black ${getSeverityColor(injuryMap.stomach)}`} id="stomach"></div>
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightArm)}`} id="rightArm"></div>
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightHand)}`} id="rightHand"></div>
                </div>
                </div>
                <div className="flex flex-row relative -top-5">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftLeg)}`} id="leftLeg"></div>
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftFoot)}`} id="leftFoot"></div>
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightLeg)}`} id="rightLeg"></div>
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightFoot)}`} id="rightFoot"></div>
                </div>
                </div>
            </div>
            <div className="w-full h-1/5 flex flex-col items-center justify-center border border-amber-50" id="below">

            </div>
            </div>
            <div className="w-1/4 h-full flex flex-col items-center justify-center border border-amber-50" id="above">
            
            </div>
        </div>

        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="right">
            <div className="w-full h-1/3 border border-amber-50"></div>
            <div className="w-full h-1/3 border border-amber-50"></div>
            <div className="w-full h-full border border-amber-50"></div>
        </div>
        </div>
    );
}
