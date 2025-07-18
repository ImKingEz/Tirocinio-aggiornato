import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-form', 
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  userName: string = '';
  userEmail: string = '';

  @Output() formSubmitted = new EventEmitter<{ name: string, email: string }>();

  constructor() { }

  onSubmit() {
    console.log('Form sottomesso!');
    console.log('Nome:', this.userName);
    console.log('Email:', this.userEmail);

    this.formSubmitted.emit({ name: this.userName, email: this.userEmail });

    this.userName = '';
    this.userEmail = '';
  }
}