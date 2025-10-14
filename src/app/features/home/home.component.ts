import { Component } from '@angular/core';
import { UploadImageComponent } from './components/upload-image/upload-image.component';

@Component({
  selector: 'app-home',
  imports: [UploadImageComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}