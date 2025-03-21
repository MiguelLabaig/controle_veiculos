import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../interfaces/user';
import { LoadBundleTask } from 'firebase/firestore';

@Component({
  selector: 'app-modal-form-user',
  templateUrl: './modal-form-user.component.html',
  styleUrl: './modal-form-user.component.scss'
})
export class ModalFormUserComponent {



  formUser: FormGroup;
  editUser: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalFormUserComponent>,
    private formBuilder: FormBuilder,
    private userService: UsersService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){}

  ngOnInit(){
    this.buildForm();
    if(this.data == this.data.firebaseId) {
      this.editUser = true;
    }
  }

  //Salvar usuário
  saveUser(){
    const objUserForm: User = this.formUser.getRawValue();

    if(this.data == this.data.firebaseId) {
      //editando o usuário
      this.userService.update(this.data.firebaseId, objUserForm).then(
        (Response: any) => {
          window.alert('Veículo editado com sucesso');
          this.closeModal();
        })
         .catch(
          err => {
            window.alert('Erro ao editar veículo')
            console.error(err);
        });

    } else{
      // Salvando usuário
      this.userService.addUser(objUserForm).then(
        (Response: any) => {
          window.alert('veículo salvo com sucesso');
          this.closeModal();
        })
         .catch(
          err => {
            window.alert('Erro ao salvar o veículo')
            console.error(err);
        });
    }
    
  }


  buildForm() {
    this.formUser = this.formBuilder.group({
      modelo: [null, [Validators.required, Validators.minLength(3)]],
      placa: [null, [Validators.required, Validators.maxLength(8)]],
      condutor: [null, [Validators.required, Validators.minLength(2)]],
      
    });
    
    if(this.data == this.data.firebaseId) {
      this.fillForm();
    }
  }

  //preencher formulário para edição
  fillForm() {

    this.formUser.patchValue({
      modelo: this.data.modelo,
      placa: this.data.placa,
      condutor: this.data.condutor
    })
  }

  closeModal() {this.dialogRef.close();}

}
