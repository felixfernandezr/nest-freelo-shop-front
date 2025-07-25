import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  hasError = signal(false);
  isPosting = signal(false);

  registerForm = this.fb.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.pattern(
          "^[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:['\\-]?[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*(?:\\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:['\\-]?[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)+$"
        )
      ]
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });


  onSubmit() {
    // 🔧 Normalizar antes de validar
    const rawName = this.registerForm.get('fullName')?.value ?? '';
    const cleanedFullName = rawName.trim().replace(/\s+/g, ' ');
    this.registerForm.get('fullName')?.setValue(cleanedFullName);

    // 👉 Ahora sí validamos
    if (this.registerForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => this.hasError.set(false), 2000);
      return;
    }

    const { fullName, email = '', password = '' } = this.registerForm.value;

    this.authService.register(fullName!, email!, password!).subscribe((ok) => {
      if (ok) {
        this.router.navigateByUrl('/');
      } else {
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 3500);
      }
    });
  }

}
