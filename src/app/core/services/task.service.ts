import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTaskRequest, Task, TaskPage, UpdateTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(page = 0, size = 12, direction = 'asc'): Observable<TaskPage> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('direction', direction);

    return this.http.get<TaskPage>(this.apiUrl, { params });
  }

  createTask(data: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, data);
  }

  updateTask(id: string, data: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
