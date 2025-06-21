export function getInitials(name) {
  return name.split(' ')
              .filter(word =>word.length > 0)
              .map(word => word[0]
              .toUpperCase())
              .join('');
}

export function formatToIndonesianTime(isoString, timeZone = 'Asia/Jakarta') {
  const date = new Date(isoString);

  const options = {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  return `${partMap.day} ${partMap.month} ${partMap.year} - ${partMap.hour}:${partMap.minute}:${partMap.second}`;
}