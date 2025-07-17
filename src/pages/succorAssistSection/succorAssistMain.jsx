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
    const canvasRef = useRef(null);
    const [accidentData, setAccidentData] = useState([]);
    const [transcripts, setTranscripts] = useState([]);
    const [injuryMap, setInjuryMap] = useState({});
    const recognitionRef = useRef(null);
    const isRecognizingRef = useRef(false);

    useEffect(() => {
        fetch("/data/accidentsData.json")
        .then((res) => res.json())
        .then((data) => setAccidentData(data))
        .catch((error) => console.log("Loading Accidents Data Error:", error));
    }, []);

    const dataMatcher = (text) => {
        return accidentData.find((item) =>
            item.accident.keywords &&
            item.accident.keywords.some((keyword) =>
            text.includes(keyword.toLowerCase())
            )
        );
    };

    const processTranscript = (rawText) => {
        const cleanedText = rawText.toLowerCase();
        const matched = dataMatcher(cleanedText);

        if (!matched) {
            console.log("No match found for transcript:", rawText);
            return;
        }

        const newMap = {};
        const affectedParts = matched.accident.affectedParts;

        Object.entries(affectedParts).forEach(([region, parts]) => {
            Object.entries(parts).forEach(([part, severity]) => {
            if (cleanedText.includes(part.toLowerCase())) {
                newMap[part] = severity;
            }
            });
        });

        if (Object.keys(newMap).length === 0) {
            Object.entries(affectedParts).forEach(([region, parts]) => {
            Object.entries(parts).forEach(([part, severity]) => {
                newMap[part] = severity;
            });
            });
        }

        setInjuryMap(newMap);
    };

    const startRecognition = () => {
        if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            setTranscripts((prev) => [...prev, "Speech Recognition is not supported in your browser."]);
            return;
        }

        if (isRecognizingRef.current) {
            setTranscripts((prev) => [...prev, "Already recording."]);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const result = event.results[event.resultIndex][0].transcript;
            setTranscripts((prev) => [...prev, `Recorded: "${result}"`]);
            processTranscript(result);
        };

        recognition.onerror = (event) => {
            setTranscripts((prev) => [...prev, `Error: ${event.error}`]);
        };

        recognition.onend = () => {
            // Only restart if user hasn't manually stopped it
            if (isRecognizingRef.current) {
            recognition.start();
            }
        };

        recognitionRef.current = recognition;
        isRecognizingRef.current = true;
        recognition.start();

        setTranscripts((prev) => [...prev, "Recording started..."]);
        };

        const stopRecognition = () => {
        if (recognitionRef.current && isRecognizingRef.current) {
            isRecognizingRef.current = false; // Prevent onend from restarting
            recognitionRef.current.stop();
            setTranscripts((prev) => [...prev, "Recording stopped."]);
        }
    };

    return (
        <div className="w-full h-screen p-0 flex lg:flex-row md:flex-row sm:flex-col gap-4 items-center justify-center">
        {/* LEFT PANEL */}
        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="left">
            <div className="w-full h-1/2 border border-amber-50 overflow-y-auto p-2 space-y-1">
            {transcripts.map((t, idx) => (
                <p key={idx} className="text-amber-200 text-sm">{t}</p>
            ))}
            </div>
            <div className="w-full h-1/2 border border-amber-50 flex flex-col gap-2 p-2 items-center justify-center">
            <Button onClick={startRecognition} className="w-full">Start</Button>
            <Button onClick={stopRecognition} className="w-full">Stop</Button>
            </div>
        </div>

        {/* CENTER BODY */}
        <div className="w-full h-full flex lg:flex-row sm:flex-col gap-4 p-4 items-center justify-between border border-amber-50">
            <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full h-full flex flex-col p-2 items-center justify-center border border-amber-50" id="center">
                <div className={`h-[50px] w-[50px] border border-black ${getSeverityColor(injuryMap.head)}`} id="head" />
                <div className="flex flex-row">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftArm)}`} />
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftHand)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[50px] w-[100px] border border-black ${getSeverityColor(injuryMap.chest)}`} />
                    <div className={`h-[50px] w-[100px] border border-black ${getSeverityColor(injuryMap.stomach)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightArm)}`} />
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightHand)}`} />
                </div>
                </div>
                <div className="flex flex-row relative -top-5">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftLeg)}`} />
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.leftFoot)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightLeg)}`} />
                    <div className={`h-[20px] w-[50px] border border-black ${getSeverityColor(injuryMap.rightFoot)}`} />
                </div>
                </div>
            </div>
            <div className="w-full h-1/5 flex flex-col items-center justify-center border border-amber-50" id="below"></div>
            </div>
            <div className="w-1/4 h-full flex flex-col items-center justify-center border border-amber-50" id="above"></div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="right">
            <div className="w-full h-1/2 border border-amber-50 overflow-y-auto p-2 space-y-1">


            </div>

            <div className="w-full h-1/3 border border-amber-50"></div>
            <div className="w-full h-full border border-amber-50"></div>
        </div>
        </div>
    );
}
