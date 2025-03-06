import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './DateRangePicker.css';

interface DateRangePickerProps {
  onChange: (range: { startDate: Date; endDate: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  singleDateMode?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  initialStartDate = new Date(),
  initialEndDate = new Date(new Date().setDate(new Date().getDate() + 7)),
  singleDateMode = false
}) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStart, setSelectingStart] = useState(true);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if a date is in the hover range
  const isInHoverRange = (year: number, month: number, day: number) => {
    if (!hoverDate || selectingStart) return false;
    
    const date = new Date(year, month, day);
    return (date > startDate && date <= hoverDate) || (date < startDate && date >= hoverDate);
  };
  
  // Check if a date is between start and end dates
  const isInRange = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date > startDate && date < endDate;
  };
  
  // Check if date is start date specifically
  const isStartDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return (
      date.getDate() === startDate.getDate() &&
      date.getMonth() === startDate.getMonth() &&
      date.getFullYear() === startDate.getFullYear()
    );
  };
  
  // Check if date is end date specifically
  const isEndDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return (
      date.getDate() === endDate.getDate() &&
      date.getMonth() === endDate.getMonth() &&
      date.getFullYear() === endDate.getFullYear()
    );
  };
  
  // Check if date is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };
  
  // Handle date hover for preview
  const handleDateHover = (day: number) => {
    if (selectingStart) return;
    
    const date = new Date(currentYear, currentMonth, day);
    setHoverDate(date);
  };
  
  // Handle date selection
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    if (singleDateMode) {
      // In single date mode, just set both start and end to the same date
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      onChange({ startDate: selectedDate, endDate: selectedDate });
      return;
    }
    
    if (selectingStart) {
      setStartDate(selectedDate);
      setEndDate(selectedDate); // Reset end date
      setSelectingStart(false);
    } else {
      // Handle end date selection
      if (selectedDate < startDate) {
        // If user selects a date before the start date, swap them
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setSelectingStart(true);
      onChange({ startDate: selectedDate < startDate ? selectedDate : startDate, 
                 endDate: selectedDate < startDate ? startDate : selectedDate });
    }
  };
  
  // Render calendar days with hover effects
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      let classNames = "calendar-day";
      
      const isStart = isStartDate(currentYear, currentMonth, day);
      const isEnd = isEndDate(currentYear, currentMonth, day);
      const isRange = isInRange(currentYear, currentMonth, day);
      const isHoverRange = isInHoverRange(currentYear, currentMonth, day);
      
      if (isStart) classNames += ' start-date';
      if (isEnd) classNames += ' end-date';
      if (isRange || isHoverRange) classNames += ' in-range';
      if (isToday(currentYear, currentMonth, day)) classNames += ' today';
      
      days.push(
        <div 
          key={day} 
          className={classNames}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => handleDateHover(day)}
          onMouseLeave={() => setHoverDate(null)}
        >
          <span className="day-number">{day}</span>
          {day === 1 && 
            <span className="month-indicator">
              {new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'short' })}
            </span>
          }
        </div>
      );
    }
    
    return days;
  };
  
  // Get month name
  const getMonthName = (month: number) => {
    return new Date(currentYear, month, 1).toLocaleString('default', { month: 'long' });
  };
  
  // Update the selection status message based on mode
  const getSelectionStatusMessage = () => {
    if (singleDateMode) {
      return "Select a date";
    }
    
    return selectingStart 
      ? "Select start date" 
      : <><strong>Start:</strong> {formatDate(startDate)} — now select end date</>;
  };
  
  return (
    <div className="modern-date-range-picker">
      <div className="selection-status">
        {getSelectionStatusMessage()}
      </div>
      
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}>
          <FaChevronLeft />
        </button>
        <div className="month-year-display">
          {getMonthName(currentMonth)} {currentYear}
        </div>
        <button className="month-nav-btn" onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}>
          <FaChevronRight />
        </button>
      </div>
      
      <div className="weekday-header">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      
      <div className="calendar-days-grid">
        {renderCalendarDays()}
      </div>
      
      {!singleDateMode && (
        <>
          <div className="selected-range-display">
            <div>
              <span className="date-label">Start</span>
              <span className="date-value">{formatDate(startDate)}</span>
            </div>
            <div className="range-arrow">→</div>
            <div>
              <span className="date-label">End</span>
              <span className="date-value">{formatDate(endDate)}</span>
            </div>
          </div>
          
          <div className="range-duration">
            <span>{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
          </div>
        </>
      )}
      
      {singleDateMode && (
        <div className="selected-date-display">
          <span className="date-label">Selected</span>
          <span className="date-value">{formatDate(startDate)}</span>
        </div>
      )}
      
      <div className="date-range-tip" style={{ display: 'none' }}></div>
    </div>
  );
};

export default DateRangePicker; 