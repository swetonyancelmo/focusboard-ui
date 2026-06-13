import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../../../core/models/task.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
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
  private dialog = inject(MatDialog);

  tasks = signal<Task[]>([]);
  totalElements = signal(0);
  pageSize = signal(12);
  pageIndex = signal(0);
  isLoading = signal(false);

  readonly statusLabels: Record<string, string> = {
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em Progresso',
    DONE: 'Concluída',
  };

  readonly priorityLabels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  };

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.tasks.set(page.content);
        this.totalElements.set(page.totalElements ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
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

  openDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: task ?? null,
      width: '90vw',
      maxWidth: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (task) {
        this.taskService.updateTask(task.id, result as UpdateTaskRequest).subscribe({
          next: () => this.loadTasks(),
        });
      } else {
        this.taskService.createTask(result as CreateTaskRequest).subscribe({
          next: () => this.loadTasks(),
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }
}
