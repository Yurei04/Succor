import Controls from "./controls";

export default function SuccorAssistMain () {
    return (
        <div className="w-full h-screen p-0 flex lg:flex-row md:flex-row sm:flex-col gap-4 items-center justify-center">
            <div className="w-1/3 h-full flex lg:flex-col sm:flex-col items-center justify-between gap-2 p-4 border border-amber-50" id="left">
                <div className="w-full h-1/2 border border-amber-50">

                </div>
                <div className="w-full h-1/2 border border-amber-50">
                    <Controls 
                    start={handleStart}
                    pause={handlePause}
                    stop={handleStop}
                    labelStart="Begin"
                    labelPause="Hold"
                    labelStop="End"
                    />
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