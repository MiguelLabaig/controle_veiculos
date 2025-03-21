import { Component, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from '../../interfaces/user';
import { MatTableDataSource } from '@angular/material/table';
import { ModalViewUserComponent } from './modal-view-user/modal-view-user.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalFormUserComponent } from './modal-form-user/modal-form-user.component';

@Component({
  selector: 'app-gestao',
  templateUrl: './gestao.component.html',
  styleUrl: './gestao.component.scss'
})
export class GestaoComponent {
  
  displayedColumns: string[] = ['id', 'modelo', 'placa', 'condutor', 'action']
  dataSource: any;
  listusers: User[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usersService: UsersService,
  public dialog: MatDialog,
) {
    this.dataSource = new MatTableDataSource<any>(this.listusers);
  }

  ngOnInit(){
    this.getListUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getListUsers(){
    this.usersService.getAllUsers().subscribe({
      next:(response: any) =>{

        this.listusers = response;

        console.log(this.listusers); // Adicione este log para verificar os dados

        this.dataSource = new MatTableDataSource<any>(this.listusers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.paginator._intl.itemsPerPageLabel="Itens por páginas";
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteUser(firebaseId: string) {
    this.usersService.deleteUser(firebaseId).then(
      (Response: any) => {
        window.alert('Usuário excluído com sucesso');
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //Logicas do modal
  openModalViewUser(user: User){
    this.dialog.open(ModalViewUserComponent, {
      width: '700px',
      height: '330px',
      data: user
    })

  }
  openModalAddUser(){
    this.dialog.open(ModalFormUserComponent, {
      width: '700px',
      height: '410px',
    }).afterClosed().subscribe(() => this.getListUsers() );

  }


  //caso alfo de errado vem e muda esse parametro para user
  openModalEditUser(placa: User){
    this.dialog.open(ModalFormUserComponent, {
      width: '700px',
      height: '410px',
      data: placa
    }).afterClosed().subscribe(() => this.getListUsers() );
  }

}
