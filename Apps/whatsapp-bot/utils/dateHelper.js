const { format, addDays, parse, isWithinInterval } = require('date-fns');

const formatDate = (date, formatString = 'dd/MM/yyyy') => {
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