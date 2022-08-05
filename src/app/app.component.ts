import { Component } from '@angular/core';
import { FireAuthService } from './services/fire-auth.service';
import { environment } from '../environments/environment.prod';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  uidAdmin = environment.uidAdmin;
  admin = false;
  vendedor = false;
  rol = '';
  public appPages = [
    
    { title: 'Login', url: '/market/login', icon: 'log-in' },
  ];

  constructor(public fireAuthService: FireAuthService) {
        this.permisos();
  }

  permisos(){
    this.fireAuthService.stateAuth().subscribe( res => {
        if(res !== null){
          if(res.uid === this.uidAdmin){
              this.admin = true;
              this.vendedor = false;
              this.rol = 'Administrador';
              this.paginas();
          } else {
              this.vendedor = true;
              this.rol = 'Vendedor';
              this.admin = false;
              this.paginas();
          }
          
        }
    });
  }

  paginas(){
    const paginas = [
      { title: 'Nueva venta', url: '/market/venta', icon: 'cart' },
      { title: 'Inventario', url: '/market/inventario', icon: 'server' },
      { title: 'Ventas', url: '/market/ventas', icon: 'stats-chart' },
      { title: 'Clientes', url: '/market/clientes', icon: 'people' },
      { title: 'Nuevo artículo', url: '/market/addinventario', icon: 'add-circle' },
      { title: 'Generar Código', url: '/market/generarCodigo', icon: 'qr-code' },
      { title: 'Imprimir Ticket', url: '/market/impresion', icon: 'print' },
      
    ];
    this.appPages = paginas;
  }

  salir(){
    this.fireAuthService.logout();
    this.vendedor = false;
    this.admin = false;
    this.rol = '';
    this.appPages = [
      { title: 'Login', url: '/market/login', icon: 'log-in' }
    ]
  }
}