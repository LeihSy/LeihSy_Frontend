import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, GroupCreateDTO, GroupUpdateDTO } from '../models/group.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = `${environment.apiBaseURL}/api`;
  private readonly http = inject(HttpClient);

  // GET /api/groups?q={q}
  getGroups(query?: string): Observable<Group[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }
    return this.http.get<Group[]>(`${this.apiUrl}/groups`, { params });
  }

  // POST /api/groups
  createGroup(payload: GroupCreateDTO): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/groups`, payload);
  }

  // POST /api/groups/{groupId}/members/{userId}
  addMember(groupId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/groups/${groupId}/members/${userId}`, {});
  }

  // DELETE /api/groups/{groupId}/members/{userId}
  removeMember(groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${groupId}/members/${userId}`);
  }

  // GET /api/groups/{id}
  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/groups/${id}`);
  }

  // DELETE /api/groups/{id}
  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`);
  }

  // PATCH /api/groups/{id}
  updateGroup(id: number, payload: GroupUpdateDTO): Observable<Group> {
    return this.http.patch<Group>(`${this.apiUrl}/groups/${id}`, payload);
  }
}

