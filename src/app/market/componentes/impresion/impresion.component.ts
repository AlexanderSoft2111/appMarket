import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-impresion',
  templateUrl: './impresion.component.html',
  styleUrls: ['./impresion.component.scss'],
})
export class ImpresionComponent implements OnInit {

  @ViewChild('ticket') ticket: HTMLElement;

  constructor() { }

  ngOnInit() {}

  imprimir() {
    //window.print();
    //this.ticket.
  }

}
