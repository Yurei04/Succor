import { useEffect, useRef, useState } from "react";
import Meyda from "meyda";

export default function useMeyda(callback) {
  const [emotion, setEmotion] = useState("neutral");
  const audioContextRef = useRef(null);
  const meydaAnalyzerRef = useRef(null);

  useEffect(() => {
    const initMeyda = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext,
        source,
        bufferSize: 512,
        featureExtractors: ["rms", "zcr", "spectralCentroid"],
        callback: (features) => {
          if (callback) callback(features);
          const { rms, zcr, spectralCentroid } = features;

          if (rms > 0.05 && zcr > 0.1) {
            setEmotion("nervous");
          } else if (spectralCentroid < 1500 && rms < 0.04) {
            setEmotion("calm");
          } else {
            setEmotion("neutral");
          }
        },
      });

      analyzer.start();
      audioContextRef.current = audioContext;
      meydaAnalyzerRef.current = analyzer;
    };

    initMeyda();

    return () => {
      meydaAnalyzerRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [callback]);

  return { emotion };
}
