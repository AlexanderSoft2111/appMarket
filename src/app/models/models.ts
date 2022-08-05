export const Paths = {
   productos: 'Productos/',
   clientes: 'Clientes/',
   ventas: 'Ventas/',
   numeroVenta: 'Numeroventa/numeroventa',
} 

export interface Producto {
    nombre: string;
    descripcion: string;
    costo_compra: number;
    check_iva: boolean
    costo_sin_iva: number;
    pvp: number;
    codigo: string;
    stock: number;
    fecha_caducidad: Date;
    stock_minimo: number;
    diferencia: number;
 }

 export interface Cliente {
     nombre: string;
     ruc: string;
     direccion: string;
     telefono: string;
     email: string;
 }

 export interface Venta {
     productos: ProductoVenta[];
     cliente: Cliente;
     subtotal_sin_iva: number;
     subtotal_con_iva: number;
     iva: number;
     total: number;
     fecha: Date;
     id: string;
     numero: number;
 }

 export interface ProductoVenta {
    cantidad: number;
    producto: Producto;
    precio: number;
 }

 export interface NumeroVenta {
     numero: number;
 }