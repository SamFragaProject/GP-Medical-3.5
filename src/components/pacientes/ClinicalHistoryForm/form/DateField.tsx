
import React, { useState, useRef, useEffect } from 'react';

// --- Helper Functions ---
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset);
    }
    return null;
};


// --- Calendar Component (Inlined) ---
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, onClose }) => {
  const [displayDate, setDisplayDate] = useState(selectedDate || new Date());

  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    onDateSelect(newDate);
  };

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };
  
  const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  return (
    <div className="absolute top-full mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-30">
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="font-semibold text-slate-800">{monthNames[month]} {year}</div>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold my-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => (
          <button
            type="button"
            key={day}
            onClick={() => handleDateClick(day)}
            className={`p-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
              isSelected(day)
                ? 'bg-blue-600 text-white font-bold'
                : isToday(day)
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100 text-slate-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};


// --- DateField Component ---
interface DateFieldProps {
  label: string;
  id: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

const DateField: React.FC<DateFieldProps> = ({ label, id, value, onChange, className }) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? parseDate(value) : null;
  
  const handleDateSelect = (date: Date) => {
    onChange(formatDate(date));
    setCalendarOpen(false);
  };

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
            type="text"
            id={id}
            name={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)} // Allow manual input
            onFocus={() => setCalendarOpen(true)}
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 pr-8"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75v.5h7V3.75a.75.75 0 011.5 0v.5h.75a2.5 2.5 0 012.5 2.5v9.5a2.5 2.5 0 01-2.5 2.5H4.25a2.5 2.5 0 01-2.5-2.5V6.75a2.5 2.5 0 012.5-2.5H5v-.5a.75.75 0 01.75-.75zM2.5 8.25v8a1 1 0 001 1h13a1 1 0 001-1v-8h-15z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
      {isCalendarOpen && (
        <Calendar 
          selectedDate={selectedDate} 
          onDateSelect={handleDateSelect} 
          onClose={() => setCalendarOpen(false)} 
        />
      )}
    </div>
  );
};

export default DateField;
