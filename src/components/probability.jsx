export default function ProbablityBox({ accident, emotion }) {
    if (!accident || !accident.accident?.probabilities || !emotion) return null;

    let { emergency, hiddenEmergency, prank } = { ...accident.accident.probabilities };

    if (emotion === "calm") {
        emergency = Math.max(0, emergency - 0.1); 
    } else if (emotion === "nervous") {
        emergency = Math.min(1, emergency + 0.1); 
    }

    return (
        <div className="w-full p-2 bg-black/70 text-amber-100 rounded-xl shadow-lg border border-amber-400">
        <div className="flex flex-col gap-2">
            <div className="border rounded-2xl border-amber-400 p-4">
                <span className="font-semibold">Emergency:</span>{" "}
                <span className="text-red-400">{(emergency * 100).toFixed(1)}%</span>
            </div>
            <div className="border rounded-2xl border-amber-400 p-4">
                <span className="font-semibold">Hidden Emergency:</span>{" "}
                <span className="text-yellow-400">{(hiddenEmergency * 100).toFixed(1)}%</span>
            </div>
            <div className="border rounded-2xl border-amber-400 p-4">
                <span className="font-semibold">Prank Call:</span>{" "}
                <span className="text-blue-400">{(prank * 100).toFixed(1)}%</span>
            </div>
        </div>
        </div>
    );
}
