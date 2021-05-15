import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VentaService } from '../../../services/venta.service';
import { Cliente, Venta, Producto, Paths, ProductoVenta } from '../../../models/models';
import { Subscription } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { PopAddProductoComponent } from '../../componentes/pop-add-producto/pop-add-producto.component';
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit, OnDestroy {

  venta: Venta;
  suscriberVenta: Subscription; 
  vuelto: number = 0;
  pago: number = 0;

  encabezados = ['Código', 'Nombre', 'Stock', 'Cantidad', 'Precio', 'IVA', 'Total']
  
  constructor(private ventaService: VentaService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController) {
        console.log('constructor venta');
        this.venta = this.ventaService.getVenta();
        this.suscriberVenta = this.ventaService.getVentaChanges().subscribe( res => {
              this.venta = res;
              console.log('getVentaChanges -> ', res);
              this.addProducto();
              this.calcularValores();
              this.changePago();
        });
        this.addProducto();
        this.calcularValores();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.suscriberVenta) {
      this.suscriberVenta.unsubscribe();
    }
  }

  async setCliente() {
      const popover = await this.popoverController.create({
        component: PopsetclientComponent,
        cssClass: 'popoverCssCliente',
        translucent: false,
        backdropDismiss: true,
        componentProps: {venta: true},
        mode: 'ios'
      });
     await popover.present();
     const { data } = await popover.onWillDismiss();
     if (data) {
       console.log(data);
       const cliente = data.cliente;
       this.venta.cliente = cliente;
       this.ventaService.saveVenta();
     }
  }

  addProducto() {
    if (this.venta) {
      const productoVenta = {
        cantidad: 1,
        producto: {
            nombre: '',
            descripcion: '',
            costo_compra: 0,
            check_iva: false,
            costo_sin_iva: 0,
            pvp: 0,
            codigo: '',
            stock: null,
            fecha_caducidad: new Date(),
            stock_minimo: 0,
            diferencia: 0
        },
        precio: 0,
      }
      if (!this.venta.productos.length) {
          this.venta.productos.push(productoVenta);
      } else {
          if (this.venta.productos[this.venta.productos.length - 1].producto.codigo.length) {
              this.venta.productos.push(productoVenta);
          }  
      }

    }
    this.setFocusNewProducto();
  }

  changeCodigo(ev: any, index: number) {
      console.log('changeCodigo() -> ', ev.detail.value);
      if (ev.detail.value.length > 5) {
        this.findProducto(ev.detail.value, index);
      }
  }

  findProducto(id: string, index: number) {
    const path = Paths.productos + id;
    this.firestoreService.getDocumentFromCache<Producto>(path).then( res => {
        if (res) {
            this.addProductoWithCode(res, index)
        } else {
           console.log('no existe producto');
        }
    })
  }

  setFocusNewProducto() {
        setTimeout(() => {
          const inputs = document.getElementsByClassName("codigo") as any;
          // console.log('setFocusNewProducto() -> ', inputs);
          if (inputs.length) {
            inputs[inputs.length -1].setFocus();
          }
        }, 500);
  }

  clearInput() {
      this.venta.productos[this.venta.productos.length - 1].producto.codigo = '';
      this.setFocusNewProducto();
  }

  // Añade un producto a la venta con el codigo escaneado
  // Aumenta la cantidad del producto si al escanear es el mismo producto
  // que ya existe
  addProductoWithCode(newproducto: Producto, index: number) {
      const productoExist = this.venta.productos.find( producto => {
             return  producto.producto.codigo === newproducto.codigo
      });
      console.log('productoExist  -> ', productoExist );
      if (productoExist.producto.nombre) {
        productoExist.cantidad ++ ;
        this.clearInput();
        this.ventaService.saveVenta();
      } else {
          this.venta.productos[index].producto = newproducto;
          this.ventaService.saveVenta();
          this.addProducto();
      }
  }


  addCantidad(producto: ProductoVenta) {
    producto.cantidad ++;
    this.ventaService.saveVenta();
  }

  removeCantidad(producto: ProductoVenta) {
      if (producto.cantidad) {
        producto.cantidad --;
        this.ventaService.saveVenta();
      }
  }

  changeCantidad(producto: ProductoVenta, index: number) {
      if (producto.cantidad === 0) {
          this.venta.productos.splice(index, 1);
          this.ventaService.saveVenta();
          return;
      }
      producto.precio = producto.cantidad * producto.producto.pvp
  }

  calcularValores() {
      if (this.venta) {
        this.venta.total = 0;
        this.venta.subtotal_con_iva = 0;
        this.venta.subtotal_sin_iva = 0;
        this.venta.iva = 0;
        this.venta.productos.forEach( item => {
              item.precio = item.cantidad * item.producto.pvp;
              this.venta.total = this.venta.total + item.precio;
              if (item.producto.check_iva) {
                 this.venta.iva = this.venta.iva + (item.precio * 0.12);
                 this.venta.subtotal_con_iva = this.venta.subtotal_con_iva + item.precio;
              } else {
                this.venta.subtotal_sin_iva = this.venta.subtotal_sin_iva + item.precio;
              }
        });
      }
  }

  // AGREGA UN NUEVO PRODUCTO DE VENTA RAPIDAMENTE
  async addProductoRapido() {
    const popover = await this.popoverController.create({
      component: PopAddProductoComponent,
      cssClass: 'popoverCss',
      translucent: false,
      backdropDismiss: true,
      mode: 'ios'
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data) {
      const producto = data as Producto;
      console.log('data -> ', data);
      const item: ProductoVenta = {
          cantidad: 1,
          precio: producto.pvp,
          producto,
      }
      if (!this.venta.productos[this.venta.productos.length - 1].producto.codigo) {
        this.venta.productos[this.venta.productos.length - 1] =  item;
      } else {
        this.venta.productos.push(item);
      }
      this.ventaService.saveVenta();
      this.addProducto();
    }

}

  resetVenta() {
     this.interaccionService.preguntaAlert('Alerta', 
            '¿Seguro que desea resetear la venta actual?').then( res => {
                if (res) {
                  this.ventaService.resetVenta();
                }
            })
  }

  changePago() {
      if (this.pago >= this.venta.total) {
            this.vuelto = this.pago - this.venta.total;
      } else {
        this.vuelto = 0;
      }
  }

  saveVenta() {
    if (!this.venta.total) {
      this.interaccionService.showToast('No se ha registrado ningún producto');
      return;
    }
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Terminar y guardar la venta actual?').then( res => {
        if (res) {
            console.log('finalizar venta');
            if (this.pago >= this.venta.total) {
              this.ventaService.saveVentaTerminada();
              this.pago = 0;
              this.vuelto = 0;
            } else {
              console.log('El valor pagado es menor el total de la vental');
              this.interaccionService.showToast('El valor pagado es menor el total de la venta', 3000);
            }
        }
    });
  }

}
