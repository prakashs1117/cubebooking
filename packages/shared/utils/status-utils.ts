import type { Status, Priority } from '../types/index';

export interface ColorToken {
  color: string;
  bg: string;
  border: string;
}

export const statusColor = (s: Status): ColorToken => {
  switch (s) {
    case "Approved":      return { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    case "Rejected":      return { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' };
    case "Under Review":  return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    case "Awaiting Input":return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    case "Draft":
    default:              return { color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
  }
};

export const priorityColor = (p: Priority): ColorToken => {
  switch (p) {
    case "Critical": return { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' };
    case "High":     return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    case "Medium":   return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    default:         return { color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
  }
};
