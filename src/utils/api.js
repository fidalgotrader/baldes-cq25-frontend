import axios from 'axios';

export const api = axios;

export function qaClass(val) {
  if (!val) return 'qa-null';
  return { OK: 'qa-ok', KO: 'qa-ko', NA: 'qa-na' }[val] || 'qa-null';
}

export function badgeClass(val) {
  if (!val) return 'badge badge-null';
  return { OK: 'badge badge-ok', KO: 'badge badge-ko', NA: 'badge badge-na' }[val] || 'badge badge-null';
}

export function formatNum(v, dec = 2) {
  if (v == null) return '—';
  return parseFloat(v).toFixed(dec);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-PT');
}

export async function downloadExcel(url, filename) {
  const token = localStorage.getItem('token');
  const resp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await resp.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
