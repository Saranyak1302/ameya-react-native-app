import {formatISO, parse, format} from 'date-fns';
import moment from 'moment';

export const formatTo12Hour = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Truncate text to a certain number of words
export const truncateText = (text: string, wordLimit: number = 32): string => {
  const words = toTitleCase2(text)?.split('');
  if (words?.length > wordLimit) {
    return words?.slice(0, wordLimit).join('') + '...';
  }
  return text;
};

function toTitleCase2(str) {
  const smallWords = ['and', 'or', 'but', 'the', 'a', 'an', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'up', 'down']; // Common small words
  
  return str
    .split(' ') // Split the string into words
    .map((word, index) => {
      // Capitalize the first and last word, or if it's not a small word
      if (index === 0 || index === str.split(' ').length - 1 || !smallWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase(); // Lowercase small words
    })
    .join(' '); // Join the words back together
}

// Convert a string to title case
export const toTitleCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
    .split(/[^a-zA-Z0-9]+/) // Split by non-word characters
    .map(txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) // Capitalize each word
    .join(' '); // Join words with a space
};

// Get the first character of a string
export const getFirstCharacter = (name: string) => {
  return name.charAt(0);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatDateMMDD = (dateString: string) => {
  return moment(dateString).format('MMM DD');
};

export const formatValue = (value: any) => {
  const num = Number(value); // Convert to number
  if (isNaN(num)) {
    return value; // Return as-is if not a valid number
  }
  return Number.isInteger(num) ? num : parseFloat(num.toFixed(2)); // Format based on type
};

export const convertToDateAndTime = (timeString: string, date?: Date) => {
  console.log("ddd",date)
  const today = date ? date : new Date();
  const formattedDate = format(today, 'dd MMMM yyyy'); // Use date-fns for consistency

  const combinedDateTime = parse(
    `${formattedDate} ${timeString}`,
    'dd MMMM yyyy hh:mm a',
    new Date()
  );

  if (combinedDateTime instanceof Date && !isNaN(combinedDateTime)) {
    return formatISO(combinedDateTime);
  } else {
    return ''; // Fallback
  }
};

export const formatTime = (time: Date) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const isPM = hours >= 12;

  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const paddedHour = hour12 < 10 ? `0${hour12}` : `${hour12}`;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const period = isPM ? 'PM' : 'AM';

  return `${paddedHour}:${paddedMinutes} ${period}`; // e.g., "03:45 PM"
};
