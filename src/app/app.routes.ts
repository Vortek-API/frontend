import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/relatorios/dashboard/dashboard.component';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { ColaboradorComponent } from './components/colaborador/colaborador.component';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { authGuard } from './guards/auth/auth.guard';
import { RegistroPontoComponent } from './components/pontos/registro-ponto/registro-ponto.component';
import { RequestComponent } from './components/reset-senha/request/request.component';
import { ResetComponent } from './components/reset-senha/reset/reset.component';

export const routes: Routes = [
    {
        path: '', component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: DashboardComponent },
            // { path: 'relatorios', component: HomeComponent },
            { path: 'pontos', component: RegistroPontoComponent },
            { path: 'empresa', component: EmpresaComponent },
            { path: 'colaborador', component: ColaboradorComponent },
            { path: '', redirectTo: '/home', pathMatch: 'full' }
        ]
    },
    
    { path: 'login', component: LoginComponent },
    { path: 'reset-senha-request', component: RequestComponent },
    { path: 'reset-senha-reset', component: ResetComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }