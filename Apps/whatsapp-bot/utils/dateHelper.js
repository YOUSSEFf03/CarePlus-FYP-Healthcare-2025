const { format, addDays, parse, isWithinInterval } = require('date-fns');

// Lebanese timezone (GMT+2 in winter, GMT+3 in summer)
const LEBANON_TIMEZONE = 'Asia/Beirut';

const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  // Handle both Date objects and time strings
  if (typeof date === 'string') {
    // If it's a time string like "09:00:00", format it as time
    if (date.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return date.substring(0, 5); // Return "09:00" format
    }
    // If it's a date string, parse it first
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return date; // Return original string if can't parse
    }
    // Convert to Lebanese timezone for display
    const lebanonTime = new Date(parsedDate.toLocaleString("en-US", {timeZone: LEBANON_TIMEZONE}));
    return format(lebanonTime, formatString);
  }
  // Convert to Lebanese timezone for display
  const lebanonTime = new Date(date.toLocaleString("en-US", {timeZone: LEBANON_TIMEZONE}));
  return format(lebanonTime, formatString);
};

const formatDateInLebanonTime = (date, formatString = 'dd/MM/yyyy HH:mm') => {
  const lebanonTime = new Date(date.toLocaleString("en-US", {timeZone: LEBANON_TIMEZONE}));
  return format(lebanonTime, formatString);
};

const convertToLebanonTime = (utcDate) => {
  return new Date(utcDate.toLocaleString("en-US", {timeZone: LEBANON_TIMEZONE}));
};

const convertFromLebanonTime = (lebanonDate) => {
  // Simple approach: treat the input as if it's already in Lebanon timezone
  // and convert it to UTC by subtracting the Lebanon offset
  
  // Create a new date to avoid mutating the original
  const utcDate = new Date(lebanonDate);
  
  // Lebanon is UTC+2 in winter, UTC+3 in summer
  // We need to subtract 2 or 3 hours to get UTC
  // For simplicity, we'll use UTC+3 (summer time) as it's more common
  
  // Subtract 3 hours (3 * 60 * 60 * 1000 milliseconds)
  // Lebanon is UTC+3, so to convert to UTC we subtract 3 hours
  utcDate.setTime(utcDate.getTime() - (3 * 60 * 60 * 1000));
  
  return utcDate;
};

const parseDateString = (dateString, formatString = 'dd/MM/yyyy') => {
  return parse(dateString, formatString, new Date());
};

const isFutureDate = (date) => {
  return date > new Date();
};

const isWorkingDay = (date) => {
  return date.getDay() !== 0; // Sunday is day 0
};

const generateDateRange = (startDate, days) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    if (isWorkingDay(date)) {
      dates.push(date);
    }
  }
  return dates;
};

module.exports = {
  formatDate,
  formatDateInLebanonTime,
  convertToLebanonTime,
  convertFromLebanonTime,
  parseDateString,
  isFutureDate,
  isWorkingDay,
  generateDateRange,
  LEBANON_TIMEZONE
};