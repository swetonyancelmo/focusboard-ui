import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task.dialog.component.html',
  styleUrl: './task-dialog.component.scss',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class TaskDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly data = signal(inject<Task | null>(MAT_DIALOG_DATA));
  readonly isEditing = computed(() => !!this.data());

  readonly statusOptions = [
    { value: 'TODO', label: 'A Fazer' },
    { value: 'IN_PROGRESS', label: 'Em Progresso' },
    { value: 'DONE', label: 'Concluída' },
  ];

  readonly priorityOptions = [
    { value: 'LOW', label: 'Baixa' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'HIGH', label: 'Alta' },
  ];

  form = this.fb.group({
    title: [this.data()?.title ?? '', Validators.required],
    description: [this.data()?.description ?? '', Validators.required],
    status: [this.data()?.status ?? 'TODO'],
    priority: [this.data()?.priority ?? 'MEDIUM'],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
