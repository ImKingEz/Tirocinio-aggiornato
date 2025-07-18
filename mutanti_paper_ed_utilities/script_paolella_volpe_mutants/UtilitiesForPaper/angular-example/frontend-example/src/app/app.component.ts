import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from './contact-form/contact-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ContactFormComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My Angular 19 App';
  welcomeMessage = 'Benvenuto nella mia applicazione Angular 19!';
  description = 'Qui sotto troverai un esempio di form.';

  handleFormSubmission(formData: { name: string, email: string }) {
    console.log('Dati del form ricevuti in AppComponent:', formData);
  }
}