import { Component} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule,
  MatIconModule,
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent  {

}
