import { Button } from "@/components/ui/button";


export default function Controls ({start, pause, stop, labelStart = "Start", labelPause = "Pause", labelStop = "Stop" }) {
    return (
        <div className="w-full h-full flex gap-2">
            <Button className={""} onClick={start}>{labelStart}</Button>
            <Button className={""} onClick={pause}>{labelPause}</Button>
            <Button className={""} onClick={stop}>{labelStop}</Button>
        </div>
    )
}
