"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Meyda from "meyda";
import ProbablityBox from "@/components/probability";
import TodayDateBox from "@/components/dateToday";


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
        return "bg-amber-200";
    }
};

export default function SuccorAssistMain() {
    const [accidentData, setAccidentData] = useState([]);
    const [transcripts, setTranscripts] = useState([]);
    const [injuryMap, setInjuryMap] = useState({});
    const [matchedAccident, setMatchedAccident] = useState(null);
    const recognitionRef = useRef(null);
    const isRecognizingRef = useRef(false);
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState("neutral");
    const audioContextRef = useRef(null);
    const analyzerRef = useRef(null);


    useEffect(() => {
        fetch("/data/accidentsData.json")
        .then((res) => res.json())
        .then((data) => setAccidentData(data))
        .catch((error) => console.log("Loading Accidents Data Error:", error));
    }, []);

    useEffect(() => {
        let animationId;
        let analyserNode;

        const startAudio = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);

            // Create canvas visualizer
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            source.connect(analyserNode);

            const bufferLength = analyserNode.fftSize;
            const dataArray = new Uint8Array(bufferLength);

            const drawWaveform = () => {
            animationId = requestAnimationFrame(drawWaveform);
            analyserNode.getByteTimeDomainData(dataArray);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f59e0b"; // Amber

            ctx.beginPath();
            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            };

            drawWaveform();

            // Set up Meyda
            analyzerRef.current = Meyda.createMeydaAnalyzer({
            audioContext,
            source,
            bufferSize: 512,
            featureExtractors: ["rms", "zcr", "spectralCentroid"],
            callback: (features) => {
                const { rms, zcr, spectralCentroid } = features;

                if (rms > 0.05 && zcr > 0.1) {
                setEmotion("agitated");
                } else if (spectralCentroid < 1500 && rms < 0.04) {
                setEmotion("calm");
                } else {
                setEmotion("neutral");
                }
            },
            });

            analyzerRef.current.start();
        };

        startAudio();

        return () => {
            if (analyzerRef.current) analyzerRef.current.stop();
            if (audioContextRef.current) audioContextRef.current.close();
            cancelAnimationFrame(animationId);
        };
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

        setMatchedAccident(matched)

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
        <div className="w-full h-screen p-0 flex lg:flex-row md:flex-row sm:flex-col gap-4 items-center justify-center bg-amber-900/20 backdrop-blur-sm">
        {/* LEFT PANEL */}
        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-500 bg-amber-700/20 backdrop-blur-md" id="left">
            <div className="w-full h-1/2 border border-amber-500 overflow-y-auto p-2 space-y-1 bg-amber-900/70 backdrop-blur-md">
            <h2 className="text-amber-300 text-center">Transcript Logs</h2>
            {transcripts.map((t, idx) => (
                <p key={idx} className="text-amber-200 text-sm">{t}</p>
            ))}
            </div>
            <div className="w-full h-1/2 border text-center border-amber-500 flex flex-col gap-2 p-2 items-center justify-center bg-amber-900/70 backdrop-blur-md">
                <h2 className="text-amber-300">Controls</h2>
                <Button variant="ghost" onClick={startRecognition} className="w-full border text-amber-300 border-amber-500 bg-amber-600/20 hover:bg-amber-900/70 cursor-pointer">Start</Button>
                <Button variant="ghost" onClick={stopRecognition} className="w-full border text-amber-300 border-amber-500 bg-amber-600/20 hover:bg-amber-900/70 cursor-pointer">Stop</Button>
            </div>
        </div>

        {/* CENTER BODY */}
        <div className="w-full h-full flex lg:flex-row sm:flex-col gap-4 p-4 items-center justify-between border border-amber-500">
            <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full h-full flex flex-col p-2 items-center justify-center border border-amber-500 bg-amber-900/10 backdrop-blur-md" id="center">
                <div className={`h-[50px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.head)}`} id="head" />
                <div className="flex flex-row">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.leftArm)}`} />
                    <div className={`h-[20px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.leftHand)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[50px] w-[100px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.chest)}`} />
                    <div className={`h-[50px] w-[100px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.stomach)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.rightArm)}`} />
                    <div className={`h-[20px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.rightHand)}`} />
                </div>
                </div>
                <div className="flex flex-row relative -top-5">
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.leftLeg)}`} />
                    <div className={`h-[20px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.leftFoot)}`} />
                </div>
                <div className="flex flex-col">
                    <div className={`h-[100px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.rightLeg)}`} />
                    <div className={`h-[20px] w-[50px] border border-black hover:bg-amber-600 ${getSeverityColor(injuryMap.rightFoot)}`} />
                </div>
                </div>
            </div>
            <div className="w-full h-1/5 flex flex-col items-center justify-start border border-amber-500 bg-amber-900/20 backdrop-blur-md" id="below">
                <h2 className="text-amber-300">Aid Recommendation</h2>
                {matchedAccident?.accident?.aidRecommendation?.map((tip, idx) => (
                    <p key={idx} className="text-amber-200 text-sm">{tip}</p>
                ))}

            </div>
            </div>
            <div className="w-1/4 h-full p-2 flex flex-col items-center justify-start border text-amber-300 border-amber-500 bg-amber-900/20 backdrop-blur-md" id="above">
             <h2 className="text-amber-300">Call Description</h2>
                {matchedAccident?.accident?.des}
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/3 h-full flex flex-col items-center justify-between gap-2 p-4 border border-amber-500 bg-amber-700/20 backdrop-blur-md" id="right">
            <div className="flex flex-col items center justify-center text-center w-full h-1/2 border border-amber-500 bg-amber-900/70 backdrop-blur-md overflow-y-auto p-2 space-y-1">
                <h2 className="text-sm font-bold text-amber-300">Detected Emotion: {emotion}</h2>
                <canvas ref={canvasRef} width={600} height={150} className="w-full mt-2 bg-black border border-amber-500" />
                <div>
                    
                </div>
            </div>

            <div className="w-full h-1/3 border border-amber-500 flex flex-col items-center justify-center bg-amber-900/70 backdrop-blur-md">
                <TodayDateBox />
            </div>
            <div className="w-full h-full border text-center border-amber-500 bg-amber-900/70 backdrop-blur-md">
                <h2 className="text-amber-300">Probablity</h2>
                {matchedAccident && (
                    <ProbablityBox 
                        accident={matchedAccident}
                        emotion={emotion}
                    />
                )}
            </div>
        </div>
        </div>
    );
}
