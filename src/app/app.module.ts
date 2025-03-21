import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ButtonComponent } from './components/button/button.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './components/menu/menu.component';

//ANGULAR MATERIAL
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';
import {MatSelectModule} from '@angular/material/select';
import{ AngularFireModule } from'@angular/fire/compat';
import { GestaoComponent } from './pages/gestao/gestao.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ModalViewUserComponent } from './pages/gestao/modal-view-user/modal-view-user.component';

import { MatDialogModule } from '@angular/material/dialog';
import { ModalFormUserComponent } from './pages/gestao/modal-form-user/modal-form-user.component';



@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    LoginComponent,
    HomeComponent,
    MenuComponent,
    GestaoComponent,
    ModalViewUserComponent,
    ModalFormUserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({
      
      "projectId":"controleveiculos-ef5c4",
      "appId":"1:857206259874:web:3fb70c8de9693fd09597fb",
      "storageBucket":"controleveiculos-ef5c4.firebasestorage.app",
      "apiKey":"AIzaSyCkQFtymnrCgUUYRnY-SqO3WjzOVl2-MCc",
      "authDomain":"controleveiculos-ef5c4.firebaseapp.com",
      "messagingSenderId":"857206259874"})),


    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
