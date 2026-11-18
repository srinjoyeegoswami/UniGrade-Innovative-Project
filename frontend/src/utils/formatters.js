export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatMarks = (marks, decimals = 1) => {
  if (marks === null || marks === undefined || marks === '') return '—';
  const num = parseFloat(marks);
  if (isNaN(num)) return marks;
  return num.toFixed(decimals);
};

export const formatPercentage = (pct, decimals = 2) => {
  if (pct === null || pct === undefined || pct === '') return '—';
  const num = parseFloat(pct);
  if (isNaN(num)) return pct;
  return `${num.toFixed(decimals)}%`;
};

export const formatGradePoint = (gp, decimals = 2) => {
  if (gp === null || gp === undefined || gp === '') return '—';
  const num = parseFloat(gp);
  if (isNaN(num)) return gp;
  return num.toFixed(decimals);
};

export const getInitials = (name) => {
  if (!name) return 'UG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

