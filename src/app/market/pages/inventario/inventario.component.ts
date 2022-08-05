import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { Paths, Producto } from '../../../models/models';

import {ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { PopoverController } from '@ionic/angular';
import { PopsetstockComponent } from '../../componentes/popsetstock/popsetstock.component';
import { InteraccionService } from '../../../services/interaccion.service';

import {Clipboard} from '@angular/cdk/clipboard';
import { FireAuthService } from '../../../services/fire-auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent implements OnInit {

  productos: Producto[] = [];
  displayedColumns: string[] = ['editar', 'nombre', 'descripcion', 
  'costo_compra', 
  'costo_sin_iva', 'pvp', 'stock', 'fecha_caducidad'];
  dataSource: MatTableDataSource<Producto>;
  campos = [{campo: 'nombre',label: 'Nombre'},
  {campo: 'descripcion',label: 'Descripción'},  
  {campo: 'costo_compra',label: 'Costo compra'},
  {campo: 'costo_sin_iva',label: 'Costo sin IVA'},  
  {campo: 'pvp',label: 'PVP'},  
  {campo: 'stock',label: 'Stock'},   
  {campo: 'fecha_caducidad',label: 'Fecha de Caducidad'},
  {campo: 'stock_minimo',label: 'Stock Minimo'}, 
  {campo: 'diferencia',label: 'Diferencia'},
];

  productosAgotados: Producto[] = [];
  productosCaducados: Producto[] = [];
  vendedor = true;
  uidAdmin = environment.uidAdmin;

  numeroFecha = 20;
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  

  constructor(private firestoreService: FirestoreService,
              private popoverController: PopoverController,
              private interaccionService: InteraccionService,
              private clipboard: Clipboard,
              private fireAuthService: FireAuthService) { }

  ngOnInit() {
    //  this.getProductos();
    this.permisos();
    
    
  }

  actualizardiferencia(){
    
  }


  permisos(){
    this.fireAuthService.stateAuth().subscribe( res => {
        if(res !== null){
          if (res.uid === this.uidAdmin){
                this.vendedor = false;
                console.log('res.uid -> ', res.uid);
          }
          
        }
    });
  }

  ionViewWillEnter() {
      this.getProductos();
  }

  getProductos() {

    this.productosAgotados = [];
    this.productosCaducados = [];
    this.firestoreService.getCollectionFromCache<Producto>(Paths.productos).then( res => {
      console.log('productos',res);
      
      if (res) {
        this.productos = res;
        this.productos.forEach( producto => {
          producto.costo_sin_iva =+ producto.costo_sin_iva.toFixed(2);
          let fechaCaducada = new Date(producto.fecha_caducidad);
          let hoy = new Date();
          let day_as_milliseconds = 86400000;
                let diff_in_millisenconds = Math.abs(fechaCaducada.getTime() - hoy.getTime());  
                let diff_in_days = diff_in_millisenconds / day_as_milliseconds;
                if(diff_in_days <= this.numeroFecha){
                    producto.diferencia = diff_in_days;
                    console.log('diferencia de dias: ',diff_in_days);
                }
            })
            this.dataSource = new MatTableDataSource(this.productos);
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
             
            }, 300);
        } 
      });
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async setStock(ev: any, producto: Producto) {
      const popover = await this.popoverController.create({
        component: PopsetstockComponent,
        event: ev,
        cssClass: 'popoverCss',
        translucent: false,
        backdropDismiss: true,
        componentProps: {producto},
        mode: 'ios'
      });
      await popover.present();
      const { data } = await popover.onWillDismiss();
  }

  getProductosFromServer() {

    this.productosAgotados = [];
    this.firestoreService.getCollection<Producto>(Paths.productos).then( res => {
        console.log('res Collection -> ', res);
        if (!res.empty) {
          this.productos = [];
        }
        res.docs.forEach( doc => {
          this.productos.push(doc.data())
        })
        this.dataSource = new MatTableDataSource(this.productos);
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          

        }, 300);
    });
  }

  copyCodigo(ev: any) {
    this.interaccionService.showToast('Código copiado: ' + ev.codigo);
    this.clipboard.copy(ev.codigo)

  }

  delete(producto: Producto) {
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Seguro que desea eliminar?').then( res => {
        if (res) {
          const path = Paths.productos;
          this.firestoreService.deleteDocumentID(path, producto.codigo);
          this.getProductos();
        }
    })
  }

  getProductosAgotados(){
    this.firestoreService.getCollectionFromCache<Producto>(Paths.productos).then( res => {

      if (res.length) {
 
          res.forEach( producto => {
              if(producto.stock <= producto.stock_minimo){
                const existe = this.productosAgotados.find(productoExiste => {
                  return productoExiste.codigo === producto.codigo;    
                });
                  if(existe === undefined){
                  this.productosAgotados.push(producto);
      
                    }
              }
              
          })
          this.dataSource = new MatTableDataSource(this.productosAgotados);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
           
          }, 300);
      } 
    });
  }

  getProductosCaducados(){
    this.firestoreService.getCollectionFromCache<Producto>(Paths.productos).then( res => {

      if (res.length) {
 
          res.forEach( producto => {
              if(producto.diferencia <= this.numeroFecha){
                const existe = this.productosCaducados.find(productoExiste => {
                  return productoExiste.codigo === producto.codigo;    
                });
                  if(existe === undefined){
                  this.productosCaducados.push(producto);
      
                    }
              }
              
          })
          this.dataSource = new MatTableDataSource(this.productosCaducados);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
           
          }, 300);
      } 
    });
  }
 

}
