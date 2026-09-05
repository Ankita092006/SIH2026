export const formatReminderTime = (timeStr, language) => {
  if (!timeStr) return '';
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return timeStr;
  
  const time = parts[0];
  const period = parts[1].toUpperCase();
  
  if (language === 'as') {
    // Convert English digits to Assamese digits
    const asNumbers = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    const localizedTime = time.split('').map(c => asNumbers[c] || c).join('');
    
    const timeParts = time.split(':');
    let hour = parseInt(timeParts[0], 10);
    
    let localizedPeriod = '';
    if (period === 'AM') {
      localizedPeriod = 'পুৱা'; // Morning
    } else {
      if (hour === 12 || (hour >= 1 && hour < 3)) {
        localizedPeriod = 'দুপৰীয়া'; // Noon/Afternoon
      } else if (hour >= 3 && hour < 5) {
        localizedPeriod = 'আবেলি'; // Late afternoon
      } else if (hour >= 5 && hour < 8) {
        localizedPeriod = 'সন্ধিয়া'; // Evening
      } else {
        localizedPeriod = 'ৰাতি'; // Night
      }
    }
    
    return `${localizedPeriod} ${localizedTime} বজা`;
  }
  
  // Return default English format if not Assamese
  return timeStr;
};

export const formatResultDateTime = (dateTimeStr, language) => {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') return dateTimeStr;
  if (language !== 'as') return dateTimeStr;

  const parts = dateTimeStr.split(' • ');
  if (parts.length !== 2) return dateTimeStr;

  const [datePart, timePart] = parts;

  // Parse Date part: "Sep 5, 2026"
  const dateRegex = /([A-Za-z]+)\s(\d+),\s(\d+)/;
  const dateMatch = datePart.match(dateRegex);

  let asDateStr = datePart;
  const asNumbers = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };

  if (dateMatch) {
    const [_, monthStr, dayStr, yearStr] = dateMatch;

    const months = {
      'Jan': 'জানুৱাৰী', 'Feb': 'ফেব্ৰুৱাৰী', 'Mar': 'মাৰ্চ', 'Apr': 'এপ্ৰিল',
      'May': 'মে', 'Jun': 'জুন', 'Jul': 'জুলাই', 'Aug': 'আগষ্ট',
      'Sep': 'ছেপ্টেম্বৰ', 'Oct': 'অক্টোবৰ', 'Nov': 'নৱেম্বৰ', 'Dec': 'ডিচেম্বৰ'
    };

    const asMonth = months[monthStr] || monthStr;
    const asDay = dayStr.split('').map(c => asNumbers[c] || c).join('');
    const asYear = yearStr.split('').map(c => asNumbers[c] || c).join('');
    asDateStr = `${asDay} ${asMonth}, ${asYear}`;
  }

  // Parse Time part: "10:26 AM"
  const timeRegex = /(\d+):(\d+)\s([APM]+)/i;
  const timeMatch = timePart.match(timeRegex);
  let asTimeStr = timePart;

  if (timeMatch) {
    const [_, hourStr, minuteStr, periodStr] = timeMatch;
    let hour = parseInt(hourStr, 10);
    let localizedPeriod = '';
    const period = periodStr.toUpperCase();

    if (period === 'AM') {
      localizedPeriod = 'পুৱা'; // Morning
    } else {
      if (hour === 12 || (hour >= 1 && hour < 3)) {
        localizedPeriod = 'দুপৰীয়া'; // Noon/Afternoon
      } else if (hour >= 3 && hour < 5) {
        localizedPeriod = 'আবেলি'; // Late afternoon
      } else if (hour >= 5 && hour < 8) {
        localizedPeriod = 'সন্ধিয়া'; // Evening
      } else {
        localizedPeriod = 'ৰাতি'; // Night
      }
    }

    const localizedTime = `${hourStr}:${minuteStr}`.split('').map(c => asNumbers[c] || c).join('');
    asTimeStr = `${localizedPeriod} ${localizedTime}`;
  }

  return `${asDateStr} • ${asTimeStr}`;
};
