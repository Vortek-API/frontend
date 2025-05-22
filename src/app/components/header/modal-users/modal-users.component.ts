import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, NgForm } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { UsersService } from './service/users.service';
import { CommonModule } from '@angular/common';

interface UserWithEmpresas {
  id: number;
  email: string;
  grupo: string;
  empresas: { id: number; nome: string }[];
  expanded: boolean;
}

@Component({
  selector: 'app-modal-users',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatProgressSpinnerModule,
    FormsModule, 
    CommonModule
  ],
  templateUrl: './modal-users.component.html',
  styleUrls: ['./modal-users.component.css'],
})
export class ModalUsersComponent implements OnInit {
  isNewUserFormOpen = false;
  isLoading = false;

  newUser = { email: '', grupo: '', empresa: [] as number[] };
  empresas: { id: number; nome: string }[] = [];
  availableCompanies: { id: number; nome: string }[] = [];

  groupedUsers: UserWithEmpresas[] = [];
  selectedCompany: Record<number, number> = {};

  constructor(
    public dialogRef: MatDialogRef<ModalUsersComponent>,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadEmpresas();
  }

  loadUsers() {
    this.usersService.getUsers().subscribe(flat => {
      const map = new Map<number, UserWithEmpresas>();
      flat.forEach(u => {
        if (!map.has(u.usuarioId)) {
          map.set(u.usuarioId, {
            id: u.usuarioId,
            email: u.usuarioEmail,
            grupo: u.usuarioGrupo,
            empresas: [],
            expanded: false
          });
        }
        map.get(u.usuarioId)!.empresas.push({
          id: u.empresaId,
          nome: u.empresaNome
        });
      });
      this.groupedUsers = Array.from(map.values());
    });
  }

  loadEmpresas() {
    this.usersService.getEmpresas().subscribe(lst => {
      this.empresas = lst;
      this.availableCompanies = lst;
    });
  }

  openNewUserForm() { 
    this.isNewUserFormOpen = true; 
  }
  closeNewUserForm() {
    this.isNewUserFormOpen = false;
    this.newUser = { email: '', grupo: '', empresa: [] };
  }
  closeModal() {
    this.dialogRef.close();
    this.closeNewUserForm();
  }

  async addUser(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched(); 
      });

      Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios corretamente.', 'warning');
      return; 
    }

    this.isLoading = true;
    const payload = {
      email: this.newUser.email,
      grupo: this.newUser.grupo.toUpperCase(),
      empresasIds: this.newUser.empresa
    };

    this.usersService.createUsers(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        await Swal.fire({
          icon: 'success',
          title: 'Usuário criado e e-mail enviado!',
          confirmButtonColor: '#3085d6'
        });
        this.loadUsers();
        this.closeNewUserForm();
      },
      error: async err => {
        this.isLoading = false;
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao criar usuário!',
          text: err.error?.error || 'Tente novamente mais tarde.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  async deleteUser(usuarioId: number) {
    const result = await Swal.fire({
      title: 'Tem certeza que deseja excluir este usuário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!result.isConfirmed) {
      return;
    }

    this.isLoading = true;
    this.usersService.deleteUser(usuarioId).subscribe({
      next: async () => {
        this.isLoading = false;
        await Swal.fire({
          icon: 'success',
          title: 'Usuário excluído com sucesso!',
          confirmButtonColor: '#3085d6'
        });
        this.loadUsers();
      },
      error: async err => {
        this.isLoading = false;
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao excluir usuário!',
          text: err.error?.error || 'Tente novamente mais tarde.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  async removeEmpresa(user: UserWithEmpresas, empresaId: number) {
    user.empresas = user.empresas.filter(e => e.id !== empresaId);

    this.usersService.updateUserEmpresas(
      user.id,
      user.empresas.map(e => e.id)
    ).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Empresa desvinculada com sucesso!',
          confirmButtonColor: '#3085d6'
        });
      },
      error: async err => {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao desvincular empresa!',
          text: err.error?.error || 'Tente novamente mais tarde.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  async addEmpresa(user: UserWithEmpresas) {
    const sel = this.selectedCompany[user.id];
    if (!sel || user.empresas.some(e => e.id === sel)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecione uma empresa válida!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    user.empresas.push(
      this.availableCompanies.find(e => e.id === sel)!
    );

    this.usersService.updateUserEmpresas(
      user.id,
      user.empresas.map(e => e.id)
    ).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Empresa vinculada com sucesso!',
          confirmButtonColor: '#3085d6'
        });
      },
      error: async err => {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao vincular empresa!',
          text: err.error?.error || 'Tente novamente mais tarde.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
