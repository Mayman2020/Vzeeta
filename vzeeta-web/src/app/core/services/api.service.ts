import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AppConstants } from '../constants/app-constants';
import { normalizeFileUrl, normalizeFileUrlsInValue } from '../utils/file-url-utils';

type UploadResponse =
  | { url?: string; filename?: string }
  | { success?: boolean; data?: { url?: string; filename?: string } };

function isWrappedUploadResponse(
  response: UploadResponse
): response is { success?: boolean; data?: { url?: string; filename?: string } } {
  return Object.prototype.hasOwnProperty.call(response, 'data');
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = this.resolveApiBase();

  constructor(private readonly http: HttpClient) {}

  private resolveApiBase(): string {
    const runtimeApi = (window as Window & { __TB_API_URL__?: string }).__TB_API_URL__;
    return runtimeApi?.trim() || AppConstants.API.baseURL;
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.normalizeResponse(this.http.get<T>(`${this.base}${path}`, { params: httpParams }));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.normalizeResponse(this.http.post<T>(`${this.base}${path}`, body));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.normalizeResponse(this.http.put<T>(`${this.base}${path}`, body));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.normalizeResponse(this.http.patch<T>(`${this.base}${path}`, body ?? {}));
  }

  delete<T>(path: string): Observable<T> {
    return this.normalizeResponse(this.http.delete<T>(`${this.base}${path}`));
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.normalizeResponse(this.http.post<T>(`${this.base}${path}`, formData));
  }

  buildUrl(path: string): string {
    return `${this.base}${path}`;
  }

  uploadFile(file: File): Observable<{ url: string; filename?: string }> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    const uploadTimeoutMs = 180_000;
    return this.http.post<UploadResponse>(`${this.base}${AppConstants.API.FILES_UPLOAD}`, fd).pipe(
      timeout(uploadTimeoutMs),
      map((res) => {
        const data = isWrappedUploadResponse(res) ? (res.data ?? {}) : res;
        return {
          url: data.url ? normalizeFileUrl(data.url) : '',
          filename: data.filename
        };
      })
    );
  }

  private normalizeResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(map((value) => normalizeFileUrlsInValue(value)));
  }
}
