import React from "react";

export default function TodayDateBox() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 bg-black text-amber-100 rounded-xl shadow-md border border-amber-400 w-fit">
      📅 <span className="font-semibold">Today:</span> {formattedDate}
    </div>
  );
}
