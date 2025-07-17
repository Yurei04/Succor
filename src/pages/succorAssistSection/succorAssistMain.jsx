"use client"
import { useEffect, useState } from "react";
import Controls from "./controls";
import { Button } from "@/components/ui/button";

export default function SuccorAssistMain () {
    const [accidentData, setAccidentData] = useState([]);
    const [current, setCurrent] = useState("");
    const [openDialog, setOpenDialog] = useState("false")


    useEffect(() => {
        fetch("")
        .then((res) => res.json())
        .then((data) => setAccidentData(data))
        .catch((error) => console.log("Loading Accidents Data Error: ", error));

    }, [])

    function startSuccor () {
       /* if(!accidentData.length || !prevPeople.length || !current) return;*/
        

    }

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false; 

        let isRecognizing = false;

        startButton.addEventListener("click", () => {
            if (!isRecognizing) {
                output.textContent = "Recording... Please speak into the microphone.";
                recognition.start();
                isRecognizing = true;

                document.querySelectorAll('.human-body svg, .human-body svg ellipse').forEach(el => {
                    el.classList.remove('highlight');
                });
            
            }
        });

        stopButton.addEventListener("click", () => {
            if (isRecognizing) {
                recognition.stop();
                isRecognizing = false;
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript: ", transcript);
            output.textContent = `Recorded: "${transcript}"`;
            processTranscription(transcript);
        };

        recognition.onerror = (event) => {
            output.textContent = `Error: ${event.error}`;
        };


        recognition.onend = () => {
            if (isRecognizing) {
                recognition.start();
            }
        };

    } else {
        const output = document.getElementById("output");
        output.textContent = "Speech Recognition is not supported in your browser.";
    }







    return (
        <div className="w-full h-screen p-0 flex lg:flex-row md:flex-row sm:flex-col gap-4 items-center justify-center">
            <div className="w-1/3 h-full flex lg:flex-col sm:flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="left">
                <div className="w-full h-1/2 border border-amber-50">

                </div>
                <div className="w-full h-1/2 border border-amber-50">
                    <Button onClick={() => startSuccor()}>Start</Button>
                </div>
            </div>
            <div className="w-full h-full flex lg:flex-row sm:flex-col gap-4 p-4 items-center justify-between border border-amber-50">
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                    <div className="w-full h-full flex flex-col items-center justify-center border border-amber-50" id="cente">

                    </div>
                    <div className="w-full h-1/5 flex flex-col items-center justify-center border border-amber-50" id="below">

                    </div>
                </div>
                <div className="w-1/4 h-full flex flex-col items-center justify-center border border-amber-50" id="above">

                </div>
            </div>
            <div className="w-1/3 h-full flex lg:flex-col sm:flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="right">
                <div className="w-full h-1/3 border border-amber-50">

                </div>
                <div className="w-full h-1/3 border border-amber-50">

                </div>
                <div className="w-full h-full border border-amber-50">

                </div>

            </div>
        </div>
    )
}