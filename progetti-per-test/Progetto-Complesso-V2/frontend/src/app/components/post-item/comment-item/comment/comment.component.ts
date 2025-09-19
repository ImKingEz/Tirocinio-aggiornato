import { Component, input } from '@angular/core';
import { CommentItem } from '../../../../_services/rest-backend/meme-rest/comment.type';

@Component({
  selector: 'app-comment',
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  commentItem = input.required<CommentItem>();
}
