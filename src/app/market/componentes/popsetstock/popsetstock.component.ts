import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Producto, Paths } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';

@Component({
  selector: 'app-popsetstock',
  templateUrl: './popsetstock.component.html',
  styleUrls: ['./popsetstock.component.scss'],
})
export class PopsetstockComponent implements OnInit {

  @Input() producto: Producto;
  stock = null;

  constructor(private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController) { }

  ngOnInit() {
        console.log('pop set -> ', this.producto);
        this.stock = this.producto.stock;
  }

  saveStock() {
    const path = Paths.productos;
    const updateDoc = {
      stock: this.stock
    }
    this.producto.stock = this.stock;
    this.firestoreService.updateDocumentID(updateDoc, path, this.producto.codigo).then( res => {
           this.interaccionService.showToast('Guardado con éxito');
    });
    this.popoverController.dismiss();
  }

  cancelar() {
      this.popoverController.dismiss();
  }

}
