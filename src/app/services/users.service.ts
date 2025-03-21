import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  

  constructor(private dataBaseStore: AngularFirestore) { }

  getAllUsers(){
    return this.dataBaseStore.collection('carros', carros => carros.orderBy('modelo')).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }
  addUser(user: User){
    return this.dataBaseStore.collection('carros').add(user);
  }
  
  //esse parametro userID ta vindo da onte?????
  update(userId: string, user: User){
    return this.dataBaseStore.collection('carros').doc(userId).update(user);
  }
//esse parametro user id ta vindo e indo pra onde?
  deleteUser(firebaseId: string){
    return this.dataBaseStore.collection('carros').doc(firebaseId).delete();
  }

}
