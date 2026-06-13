import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
  ],
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tasks: Task[] = [];
  totalElements = 0;
  pageSize = 12;
  pageIndex = 0;
  isLoading = false;

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.tasks = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadTasks();
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }
}
