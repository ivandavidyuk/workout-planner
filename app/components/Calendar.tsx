import React from "react";

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <input
      type="date"
      min={today}
      value={selectedDate}
      onChange={(e) => onDateChange(e.target.value)}
      className="border border-gray-300 rounded p-2"
    />
  );
};

export default Calendar;
