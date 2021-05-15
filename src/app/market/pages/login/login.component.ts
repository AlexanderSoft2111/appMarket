
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FireAuthService } from '../../../services/fire-auth.service';
import { InteraccionService } from '../../../services/interaccion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  userForm: FormGroup = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    contrasena: ['',[Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb:FormBuilder,
              private fireAuthService:FireAuthService,
              private route:Router,
              private interaccionService:InteraccionService) { }

  user = {
    email: '',
    contrasena: ''
  }

  ngOnInit() {
    
  }

  
  ingresar(){
    this.user.email = this.userForm.controls.email.value;
    this.user.contrasena = this.userForm.controls.contrasena.value;
    this.fireAuthService.login(this.user.email, this.user.contrasena).then( res => {
      this.route.navigate(['/market/venta']);
      this.userForm.reset();
    }).catch( () => {
      this.interaccionService.showToast("Usuario o contraseña incorrectos");
    });
    this.obtener();
  }



  campoNoValido(campo: string){
    return this.userForm.controls[campo].errors &&
            this.userForm.controls[campo].touched;
  }

  async obtener(){
    const uid = await this.fireAuthService.getUid();
    console.log(uid);
  }

  onKeyPress(){
      this.ingresar();
  }

}
