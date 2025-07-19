import {
  Component,
  EventEmitter,
  Output,
  inject,
  ViewChild,
  ElementRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { User } from '@auth/interfaces/user.interface';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { startWith } from 'rxjs';

@Component({
  selector: 'user-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-search.component.html',
})
export class UserSearchComponent {
  private authService = inject(AuthService);

  searchControl = new FormControl('');
  matchedUsers = signal<Partial<User>[]>([]);
  highlightedIndex = signal(-1);

  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;
  @Output() userSelected = new EventEmitter<Partial<User>>();

  constructor() {
    const currentUser = this.authService.user(); // signal<User | null>

    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.authService.searchUsers(term ?? '')),
        map(users => {
        const currentId = currentUser!.id;
        return users.filter(u => u.id !== currentId); // 👈 excluye al actual
      })
    )
    .subscribe(filteredUsers => {
      this.matchedUsers.set(filteredUsers ?? []);
      this.highlightedIndex.set(-1);
    });
  }

  selectUser(user: Partial<User>) {
    this.userSelected.emit(user);
    this.searchControl.setValue('');
    this.matchedUsers.set([]);
    this.highlightedIndex.set(-1);
  }

  handleKeydown(event: KeyboardEvent) {
    const users = this.matchedUsers();
    if (!users.length) return;

    const maxIndex = users.length - 1;
    const currentIndex = this.highlightedIndex();

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex.set(Math.min(currentIndex + 1, maxIndex));
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.highlightedIndex.set(Math.max(currentIndex - 1, 0));
        event.preventDefault();
        break;
      case 'Enter':
        if (currentIndex >= 0 && currentIndex < users.length) {
          this.selectUser(users[currentIndex]);
        }
        event.preventDefault();
        break;
    }
  }
}
