import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Paths, Producto } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { ActivatedRoute } from '@angular/router';
import { InteraccionService } from '../../../services/interaccion.service';
import { IonInput } from '@ionic/angular';


@Component({
  selector: 'app-addinventario',
  templateUrl: './addinventario.component.html',
  styleUrls: ['./addinventario.component.scss'],
})
export class AddinventarioComponent implements OnInit {

  articuloForm = this.fb.group({
    nombre: [null, Validators.required],
    descripcion: [null, Validators.required],
    costo_compra: [null, [Validators.required, Validators.min(0)]],
    check_iva: [null],
    costo_sin_iva: [null, [Validators.required, Validators.min(0)]],
    pvp: [null, [Validators.required, Validators.min(0)]],
    codigo: [{value: null, disabled: true}, Validators.required, ],
    stock: [0, [Validators.required,Validators.min(0)]],
    fecha_caducidad: [null, Validators.required],
    stock_minimo: [0, [Validators.required, Validators.min(0)]],
    // costo_reducido: [null],
  });

  codigoProducto = null;
  producto: Producto = null;
  titulo = 'Nuevo Artículo';
  descripcion = 'Agregar nuevo artículo';
  IVA = 0.12;
  
  @ViewChild('codigo') codigoInput: IonInput;

  constructor(private fb: FormBuilder,
              private firestoreService: FirestoreService,
              private activatedRoute: ActivatedRoute,
              private interaccionService: InteraccionService) { 

                this.codigoProducto = this.activatedRoute.snapshot.paramMap.get('id');
                console.log('id -> ',  this.codigoProducto);
                if (this.codigoProducto) {
                  console.log('producto ',this.codigoProducto);
                   this.findProducto(this.codigoProducto);
                }

              }

  ngOnInit() {
      this.focusInputCodigo();
      this.articuloForm.controls['check_iva'].valueChanges.subscribe( (value: Boolean) => {
          this.setCostoSinIva();
      });
      this.articuloForm.controls['costo_compra'].valueChanges.subscribe( (value: Boolean) => {
        this.setCostoSinIva();
      });
  }

  campoNoValido(campo: string): boolean{
     return this.articuloForm.controls[campo].errors &&
            this.articuloForm.controls[campo].touched;
  }

  focusInputCodigo() {
      setTimeout( () => { 
        this.codigoInput.setFocus();
      }, 500); 
  }

  setCostoSinIva() {
      const check_iva = this.articuloForm.controls['check_iva'].value;
      const costo_compra = this.articuloForm.controls['costo_compra'].value;
      if (costo_compra) {
          let costo_sin_iva = null;
          if (check_iva) {
            costo_sin_iva = costo_compra  - (costo_compra * this.IVA) 
          } else {
            costo_sin_iva = costo_compra;
          }
          this.articuloForm.controls['costo_sin_iva'].setValue(costo_sin_iva);      
      }
  }

  changeCodigo() {
     this.articuloForm.controls['codigo'].setValue(this.codigoProducto);
     if (this.codigoProducto.length > 5) {
       this.findProducto(this.codigoProducto);
     }
  }

   onSubmit() {

    if(this.articuloForm.invalid){
      this.articuloForm.markAllAsTouched;

    } else {

          if (this.articuloForm.controls['codigo'].value === null) {
              this.interaccionService.showToast('Escanea el código del prodcuto');
              return;
          }
      
          let newArticulo: Producto = {
            nombre: this.articuloForm.controls['nombre'].value,
            descripcion: this.articuloForm.controls['descripcion'].value,
            costo_compra: this.articuloForm.controls['costo_compra'].value,
            check_iva: this.articuloForm.controls['check_iva'].value,
            costo_sin_iva: this.articuloForm.controls['costo_sin_iva'].value,
            pvp: this.articuloForm.controls['pvp'].value,
            codigo: this.articuloForm.controls['codigo'].value,
            stock: this.articuloForm.controls['stock'].value,
            fecha_caducidad: this.articuloForm.controls['fecha_caducidad'].value,
            stock_minimo: this.articuloForm.controls['stock_minimo'].value,
            diferencia: 0,
          };
        let fechaCaducada = new Date(newArticulo.fecha_caducidad);
        let hoy = new Date();
        let day_as_milliseconds = 86400000;
        let diff_in_millisenconds = Math.abs(fechaCaducada.getTime() - hoy.getTime());  
        let diff_in_days = diff_in_millisenconds / day_as_milliseconds;
        newArticulo.diferencia = diff_in_days;
          const path = Paths.productos;
          this.firestoreService.createDocumentID<Producto>(newArticulo, path, newArticulo.codigo).then( res => {
                this.interaccionService.showToast('Guardado con éxito');
              });
              this.resetForm();
              this.codigoProducto = '';
              newArticulo = {
                nombre: '',
                descripcion: '',
                costo_compra: null,
                check_iva: null,
                costo_sin_iva: null,
                pvp: null,
                codigo: '',
                stock: null,
                fecha_caducidad: new Date(),
                stock_minimo: null,
                diferencia: null,
              };
                
              console.log('this.articuloForm.status -> ', this.articuloForm.status);
    }



  }

  findProducto(id: string) {
    
      const path = Paths.productos + id;
      this.firestoreService.getDocumentFromCache<Producto>(path).then( res => {
          if (res) {
              this.titulo = 'Editar Artículo';
              this.descripcion = 'Editar artículo existente';
              this.producto = res;
              this.articuloForm.controls['nombre'].setValue(this.producto.nombre);
              this.articuloForm.controls['descripcion'].setValue(this.producto.descripcion);
              this.articuloForm.controls['costo_compra'].setValue(this.producto.costo_compra);
              this.articuloForm.controls['check_iva'].setValue(this.producto.check_iva);
              this.articuloForm.controls['costo_sin_iva'].setValue(this.producto.costo_sin_iva);
              this.articuloForm.controls['pvp'].setValue(this.producto.pvp);
              this.articuloForm.controls['codigo'].setValue(this.producto.codigo);
              this.articuloForm.controls['stock'].setValue(this.producto.stock);
              this.articuloForm.controls['fecha_caducidad'].setValue(this.producto.fecha_caducidad);
              this.articuloForm.controls['stock_minimo'].setValue(this.producto.stock_minimo);
          } else {
             console.log('no existe producto');
             this.producto = null;
             this.titulo = 'Nuevo Artículo';
             this.descripcion = 'Agregar nuevo artículo';
             this.resetBusqueda();
          }
      }).catch( () => {
          console.log('no existe producto');
          this.producto = null;
          this.titulo = 'Nuevo Artículo';
          this.descripcion = 'Agregar nuevo artículo';
          this.resetBusqueda();
      })
  }

  resetForm() {    

    this.articuloForm.reset();
    this.codigoProducto = '';
    
  }

  resetBusqueda(){
    this.articuloForm.controls['nombre'].setValue('');
    this.articuloForm.controls['descripcion'].setValue('');
    this.articuloForm.controls['costo_compra'].setValue('');
    this.articuloForm.controls['check_iva'].setValue('');
    this.articuloForm.controls['costo_sin_iva'].setValue('');
    this.articuloForm.controls['pvp'].setValue('');
    this.articuloForm.controls['stock'].setValue('');
    this.articuloForm.controls['fecha_caducidad'].setValue('');
    this.articuloForm.controls['stock_minimo'].setValue('');
  }



}
