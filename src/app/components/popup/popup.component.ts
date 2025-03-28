import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  isVisible = false; 

  openPopup(){
    this.isVisible = true;
  }

  closePopup(){
    this.isVisible = false;
  }

}
