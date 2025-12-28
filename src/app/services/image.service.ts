import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = 'http://localhost:8080/api/images';

  constructor(private http: HttpClient) {}

  // POST /api/images (Upload a product image)
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl, formData);
  }

  // GET /api/images/{filename} (Get a product image)
  getImage(filename: string): string {
    return `${this.apiUrl}/${filename}`;
  }

  // DELETE /api/images/{filename} (Delete a product image)
  deleteImage(filename: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${filename}`);
  }
}

