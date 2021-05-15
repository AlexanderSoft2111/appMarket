import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../models/models';
import { PopoverController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-pop-add-producto',
  templateUrl: './pop-add-producto.component.html',
  styleUrls: ['./pop-add-producto.component.scss'],
})
export class PopAddProductoComponent implements OnInit {

  producto: Producto = {
      nombre: '',
      descripcion: '',
      costo_compra: null,
      check_iva: false,
      costo_sin_iva: null,
      pvp: 0,
      codigo: 'xxxx',
      stock: 1,
      fecha_caducidad: new Date(),
      stock_minimo: 0,
      diferencia: 0,
  }

  constructor(private popoverController: PopoverController,
              private fb: FormBuilder,) { }

  ngOnInit() {}

  add() {
      this.popoverController.dismiss(this.producto);
  }

  close() {
    this.popoverController.dismiss();
  }

}
