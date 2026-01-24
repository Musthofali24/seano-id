import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";

const formatDisplayDate = (value) => {
  if (!value) return "dd/mm/yyyy";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "dd/mm/yyyy";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatValueForInput = (value) => {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const DatePickerField = ({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value ? new Date(value) : null);
  const ref = useRef(null);

  useEffect(() => {
    if (value) setInternalValue(new Date(value));
    else setInternalValue(null);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date) => {
    setInternalValue(date);
    onChange?.(formatValueForInput(date));
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInternalValue(null);
    onChange?.("");
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setInternalValue(today);
    onChange?.(formatValueForInput(today));
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full min-w-[160px] bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center justify-between gap-2"
      >
        <span className={internalValue ? "" : "text-gray-500 dark:text-gray-400"}>
          {internalValue ? formatDisplayDate(internalValue) : placeholder}
        </span>
        <FaCalendarAlt className="text-gray-500 dark:text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 date-picker-popover rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
          <Calendar
            onChange={handleSelect}
            value={internalValue}
            minDate={minDate ? new Date(minDate) : undefined}
            maxDate={maxDate ? new Date(maxDate) : undefined}
            className="date-picker-calendar border-0"
            locale="en-US"
          />
          <div className="flex justify-between p-2 border-t border-gray-200 dark:border-slate-600">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
