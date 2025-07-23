import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'form-error-label',
  standalone: true,
  templateUrl: './form-error-label.component.html',
})
export class FormErrorLabelComponent {
  control = input.required<AbstractControl>();

  get errorMessage(): string | null {
    const errors: ValidationErrors = this.control().errors || {};
    return this.control().touched && Object.keys(errors).length > 0
      ? this.getTextError(errors)
      : null;
  }

  private getTextError(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
    }

    if (errors['maxlength']) {
      return `No puede tener más de ${errors['maxlength'].requiredLength} caracteres.`;
    }

    if (errors['email']) {
      return 'Debe ser un correo electrónico válido.';
    }

    if (errors['pattern']) {
      return 'El formato no es válido.';
    }

    // Agrega más errores personalizados si es necesario
    return 'Campo inválido.';
  }
}
