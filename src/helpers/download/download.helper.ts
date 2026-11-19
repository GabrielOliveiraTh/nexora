import axios from 'axios';
import { BACKEND_ENABLED, BackendDisabledError } from '@config/backend/backend.config';

interface DownloadItem {
  url: string;
  filename: string;
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
}

const MAX_CONCURRENT = 3;
/** Revoking right after click() can cancel the download (Safari). */
const REVOKE_DELAY_MS = 10_000;

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = Array.isArray(value) ? value.join(';') : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds an RFC 4180 CSV (CRLF line endings) from a list of records. */
export function toCsv<T extends object>(rows: readonly T[], columns: readonly (keyof T & string)[]): string {
  const header = columns.map(escapeCsvCell).join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvCell(row[col])).join(','));
  return [header, ...lines].join('\r\n');
}

export function downloadCsv<T extends object>(
  rows: readonly T[],
  columns: readonly (keyof T & string)[],
  filename: string,
): void {
  // BOM so Excel detects UTF-8 (accents in names).
  downloadBlob(new Blob(['\uFEFF', toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' }), filename);
}
let activeCount = 0;
const queue: DownloadItem[] = [];

function processQueue(): void {
  while (activeCount < MAX_CONCURRENT && queue.length > 0) {
    const item = queue.shift();
    if (!item) return;

    activeCount++;
    axios
      .get<Blob>(item.url, { responseType: 'blob' })
      .then((response) => {
        downloadBlob(response.data, item.filename);
        item.resolve(response.data);
      })
      .catch((error: Error) => item.reject(error))
      .finally(() => {
        activeCount--;
        processQueue();
      });
  }
}

export function enqueueDownload(url: string, filename: string): Promise<Blob> {
  if (!BACKEND_ENABLED) return Promise.reject(new BackendDisabledError(`GET ${url}`));
  return new Promise((resolve, reject) => {
    queue.push({ url, filename, resolve, reject });
    processQueue();
  });
}

export function getQueueLength(): number {
  return queue.length + activeCount;
}
