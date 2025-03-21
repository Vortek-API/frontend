import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  standalone: false,
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  menuItems = [
    { icon: 'bell', active: false },
    { icon: 'log-out', active: false },
    { icon: 'grid', active: false },
    { icon: 'trending-up', active: false },
    { icon: 'user', active: false },
    { icon: 'share-2', active: true },
    { icon: 'bar-chart', active: false },
    { icon: 'calendar', active: false },
    { icon: 'settings', active: false },
    { icon: 'shield', active: false }
  ];

  selectItem(item: any) {
    this.menuItems.forEach(i => i.active = false);
    item.active = true;
  }
}