import { Component, OnInit } from '@angular/core';
import { DiaCalendario } from '../../models/dia-calendario';

@Component({
  selector: 'app-calendario',
  imports: [],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss'
})
export class Calendario implements OnInit {

  fechaActual = new Date();

  mesMostrado = this.fechaActual.getMonth();
  anioMostrado = this.fechaActual.getFullYear();

  dias: DiaCalendario[] = [];

  fechaSeleccionada: Date | null = null;

  nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  ngOnInit(): void {
    this.generarCalendario();
  }

  generarCalendario(): void {

    this.dias = [];

    const primerDiaMes = new Date(
      this.anioMostrado,
      this.mesMostrado,
      1
    );

    const ultimoDiaMes = new Date(
      this.anioMostrado,
      this.mesMostrado + 1,
      0
    );

    // JS: domingo = 0.
    // Nuestro calendario comienza el lunes.
    let diaSemanaInicio = primerDiaMes.getDay();

    diaSemanaInicio =
      diaSemanaInicio === 0
        ? 6
        : diaSemanaInicio - 1;

    // Días del mes anterior
    for (let i = diaSemanaInicio; i > 0; i--) {

      const fecha = new Date(
        this.anioMostrado,
        this.mesMostrado,
        1 - i
      );

      this.agregarDia(fecha, false);
    }

    // Mes actual
    for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {

      const fecha = new Date(
        this.anioMostrado,
        this.mesMostrado,
        dia
      );

      this.agregarDia(fecha, true);
    }

    // Completar hasta 42 celdas = 6 semanas
    while (this.dias.length < 42) {

      const ultimo = this.dias[this.dias.length - 1].fecha;

      const fecha = new Date(ultimo);

      fecha.setDate(fecha.getDate() + 1);

      this.agregarDia(fecha, false);
    }
  }


  private agregarDia(
    fecha: Date,
    esMesActual: boolean
  ): void {

    const hoy = this.normalizarFecha(new Date());

    const fechaComparar = this.normalizarFecha(fecha);

    const fechaLimite = new Date(hoy);

    fechaLimite.setDate(fechaLimite.getDate() + 7);

    const disponible =
      esMesActual &&
      fechaComparar >= hoy &&
      fechaComparar <= fechaLimite;

    this.dias.push({
      fecha,
      numero: fecha.getDate(),
      esMesActual,
      esHoy:
        fechaComparar.getTime() === hoy.getTime(),
      disponible,
      seleccionado:
        this.fechaSeleccionada !== null &&
        fechaComparar.getTime() ===
        this.normalizarFecha(
          this.fechaSeleccionada
        ).getTime()
    });
  }


  seleccionarDia(dia: DiaCalendario): void {

    if (!dia.disponible) {
      return;
    }

    this.fechaSeleccionada = dia.fecha;

    this.generarCalendario();
  }


  mesAnterior(): void {

    this.mesMostrado--;

    if (this.mesMostrado < 0) {
      this.mesMostrado = 11;
      this.anioMostrado--;
    }

    this.generarCalendario();
  }


  mesSiguiente(): void {

    this.mesMostrado++;

    if (this.mesMostrado > 11) {
      this.mesMostrado = 0;
      this.anioMostrado++;
    }

    this.generarCalendario();
  }


  private normalizarFecha(fecha: Date): Date {

    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );
  }

}
