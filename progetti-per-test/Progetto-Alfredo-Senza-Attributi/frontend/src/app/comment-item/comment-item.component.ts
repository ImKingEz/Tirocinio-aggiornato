import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentData } from '../_services/rest-backend/comment-item.type';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.scss'
})
export class CommentItemComponent {
  @Input({ required: true }) comment: CommentData;
}