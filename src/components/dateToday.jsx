import React, { useEffect, useState } from "react";

export default function TodayDateBox() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    return (
        <div className="p-4 bg-black text-amber-100 rounded-xl shadow-md border border-amber-400 w-fit">
        <div>📅 <span className="font-semibold">Today:</span> {formattedDate}</div>
        <div>🕒 <span className="font-semibold">Time:</span> {formattedTime}</div>
        </div>
    );
}
