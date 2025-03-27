import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RelatoriosComponent } from './components/relatorios/relatorios.component';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { ColaboradorComponent } from './components/colaborador/colaborador.component';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

export const routes: Routes = [
    {path: '', component: MainLayoutComponent, children: [
        { path: 'home', component: HomeComponent },
        { path: 'relatorios', component: RelatoriosComponent },
        { path: 'empresa', component: EmpresaComponent },
        { path: 'colaborador', component: ColaboradorComponent },
        { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]},
    {path: 'login', component: LoginComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
