import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Corte } from '../../models/corte';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo {

  cortes: Corte[] = [

    {
      id: 1,
      nombre: 'Degradado',
      descripcion: 'Degradado moderno con terminaciones precisas.',
      precio: 10000,
      imagen: '/assets/images/cortes/degradado.jpg'
    },

    {
      id: 2,
      nombre: 'Corte clásico',
      descripcion: 'Un estilo tradicional, limpio y elegante.',
      precio: 10000,
      imagen: '/assets/images/cortes/clasico.jpg'
    },

    {
      id: 3,
      nombre: 'Promo : Corte + barba',
      descripcion: 'Corte completo acompañado de perfilado de barba.',
      precio: 10000,
      imagen: '/assets/images/cortes/corte-barba.jpg'
    },

    {
      id: 4,
      nombre: 'Corte + cejas + barba',
      descripcion: 'Corte personalizado, perfilado de cejas y barba.',
      precio: 15000,
      imagen: '/assets/images/cortes/diseno.jpg'
    }

  ];

}
