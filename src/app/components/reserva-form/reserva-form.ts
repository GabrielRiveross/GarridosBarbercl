import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Reserva } from '../../models/reserva';


@Component({
  selector: 'app-reserva-form',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.scss'
})
export class ReservaForm {

  // Fecha seleccionada en el calendario
  @Input() fecha!: Date;

  // Hora seleccionada
  @Input() hora!: string;


  // Evento para volver desde el formulario
  // hacia la selección de horarios.
  @Output()
  cancelar = new EventEmitter<void>();


  // Evento que enviará la reserva terminada
  // hacia el componente calendario.
  @Output()
  reservaCreada = new EventEmitter<Reserva>();


  formulario: FormGroup;


  constructor(
    private fb: FormBuilder
  ) {

    this.formulario = this.fb.group({

      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40)
        ]
      ],


      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40)
        ]
      ],


      telefono: [
        '',
        [
          Validators.required,

          Validators.pattern(
            /^(\+?56)?\s?9[\s-]?\d{4}[\s-]?\d{4}$/
          )
        ]
      ]

    });

  }


  confirmarReserva(): void {

    // Si algún campo no es válido,
    // mostramos los errores.
    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      return;
    }


    /*
     * Quitamos espacios y guiones del teléfono.
     *
     * Ejemplo:
     *
     * +56 9 1234 5678
     *
     * pasa a:
     *
     * +56912345678
     */

    const telefonoLimpio =
      this.formulario.value.telefono
        .replace(/\s/g, '')
        .replace(/-/g, '');


    const reserva: Reserva = {

      nombre:
        this.formulario.value.nombre.trim(),

      apellido:
        this.formulario.value.apellido.trim(),

      telefono:
      telefonoLimpio,

      fecha:
        this.formatearFecha(this.fecha),

      hora:
      this.hora

    };


    /*
     * Todavía NO guardamos la reserva.
     *
     * Simplemente enviamos el objeto al
     * componente calendario.
     *
     * Posteriormente este objeto será enviado
     * mediante HTTP a nuestro Worker.
     */

    this.reservaCreada.emit(reserva);

  }


  volver(): void {

    this.cancelar.emit();

  }


  /*
   * Convierte:
   *
   * Date
   *
   * a:
   *
   * YYYY-MM-DD
   *
   * Ejemplo:
   *
   * 3 de octubre de 2026
   *
   * →
   *
   * 2026-10-03
   */

  private formatearFecha(
    fecha: Date
  ): string {

    const anio =
      fecha.getFullYear();


    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(2, '0');


    const dia =
      String(
        fecha.getDate()
      ).padStart(2, '0');


    return `${anio}-${mes}-${dia}`;

  }

}
