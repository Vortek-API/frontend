import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { LucideAngularModule, Bell, LogOut, Grid, TrendingUp, User, Share2, BarChart, Calendar, Settings, Shield } from 'lucide-angular';


@NgModule({
  declarations: [
    SideBarComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    LucideAngularModule.pick({ Bell, LogOut, Grid, TrendingUp, User, Share2, BarChart, Calendar, Settings, Shield })
  ],
  exports: [
    HeaderComponent,
    SideBarComponent
  ]
})
export class MenusModule { }
