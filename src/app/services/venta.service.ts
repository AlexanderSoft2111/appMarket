import { Injectable } from '@angular/core';
import { NumeroVenta, Venta, Paths, ProductoVenta } from '../models/models';
import { LocalstorageService } from './localstorage.service';
import { FirestoreService } from './firestore.service';
import { Subject } from 'rxjs';
import { InteraccionService } from './interaccion.service';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  venta: Venta;
  ventas: Venta[] = [];
  venta$ = new Subject<Venta>();
  ventas$ = new Subject<Venta[]>();
  pathLocal = 'venta';
  numeroVenta: NumeroVenta;


  constructor(private localstorageService: LocalstorageService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService) {
        this.setVenta();
        this.getVentas();
   }

  setVenta() {
      this.localstorageService.getDoc(this.pathLocal).then( async (res) => {
          console.log('getVenta -> ', res);
          if (res) {
              this.venta = res;
              this.venta.numero = (await this.getNumerVenta()).numero
              this.venta$.next(this.venta);
          } else {
            this.initVenta();
          }
      });
  }

  saveVenta() {
      this.localstorageService.setDoc(this.pathLocal, this.venta);
      this.venta$.next(this.venta);
  }

  async initVenta() {
      this.venta = {
        productos: [],
        cliente: {
          nombre: null,
          ruc: null,
          direccion: null,
          telefono: null,
          email: null,
        },
        subtotal_sin_iva: 0,
        subtotal_con_iva: 0,
        iva: 0,
        total: 0,
        fecha: new Date(),
        id: this.firestoreService.createIdDoc(),
        numero: null
      }
      this.venta.numero = (await this.getNumerVenta()).numero
      this.venta$.next(this.venta);
  }

  getVenta() {
      return this.venta
  }

  getVentaChanges() {
    this.venta$.next(this.venta);
    return this.venta$.asObservable();
  }

  getVentasChanges() {
    this.ventas$.next(this.ventas);
    return this.ventas$.asObservable();
  }

  getNumerVenta(): Promise<NumeroVenta> {
    return new Promise((resolve) => {
        const path = Paths.numeroVenta;
        this.firestoreService.getDocument<NumeroVenta>(path).then ( res => {
            console.log('getNumerVenta() -> ', res.data());
            if (res.exists) {
                this.numeroVenta = res.data();
                this.numeroVenta.numero ++;
            } else {
                this.numeroVenta = {
                   numero: 1,
                }
            }
            resolve(this.numeroVenta);
            return;
        })
    });

  }

  setNumberVenta() {
      console.log('setNumberVenta()')
      const path = 'Numeroventa/';
      const id = 'numeroventa';
      const updateDoc: NumeroVenta = {
        numero: this.venta.numero
      }
      console.log('setNumberVenta() -> ', updateDoc, path, id)
      this.firestoreService.createDocumentID(updateDoc, path, id).then( () => {
         console.log('guarddo')
      }).catch( error => {
        console.log('error -> setNumberVenta() ', error);
      })
  }

  resetVenta() {
     this.initVenta();
     this.saveVenta();
  }

  // Guarda la venta final
  async saveVentaTerminada() {
      if (this.venta.productos.length) {
          await this.interaccionService.presentLoading();
          this.disminuirStock();
          this.venta.fecha = new Date();
          const path = Paths.ventas;
          this.ventas.push(this.venta);
          this.ventas$.next(this.ventas);
          this.localstorageService.setDoc(path, this.ventas).then( () => {
                  this.interaccionService.showToast('Venta guardada con éxito');
                  this.setNumberVenta();
                  this.resetVenta();
                  this.interaccionService.dismissLoading();
          }).catch( err => {
              console.log('error localstorageService.setDoc -> ', err);
          })
        }

  }

  async getVentas() {
      const path = Paths.ventas;
      this.localstorageService.getDoc(path).then( async (res) => {
          console.log('getVentas() -> ', res);
          if (res) {
              this.ventas = res;
              this.ventas$.next(this.ventas);
          }
      });
  }

  disminuirStock() {
      console.log('disminuirStock()');
      const path = Paths.productos;
      this.venta.productos.forEach( item => {
            if (item.producto.codigo && item.producto.stock) {
                if (item.producto.codigo === 'xxxx') { return};
                const updateDoc = {
                  stock: item.producto.stock - item.cantidad
                };  
                console.log('disminuirStock()', updateDoc, path, item.producto.codigo)
                this.firestoreService.updateDocumentID(updateDoc, path, item.producto.codigo).catch( error => {
                   console.log('error disminuirStock() -> ', error);
                })
            }
      });
  }

  resetReport() {
     const path = Paths.ventas;  
     this.ventas = [];
     this.localstorageService.setDoc(path, this.ventas);
     this.ventas$.next(this.ventas);
  }

}
