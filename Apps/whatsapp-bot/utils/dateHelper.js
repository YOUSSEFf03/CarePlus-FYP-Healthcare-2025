const { format, addDays, parse, isWithinInterval } = require('date-fns');

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
    return format(parsedDate, formatString);
  }
  return format(date, formatString);
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
  parseDateString,
  isFutureDate,
  isWorkingDay,
  generateDateRange
};