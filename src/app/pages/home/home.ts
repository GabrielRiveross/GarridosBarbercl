import { Component } from '@angular/core';

import {Navbar} from '../../components/navbar/navbar';
import {Hero} from '../../components/hero/hero';
import {Catalogo} from '../../components/catalogo/catalogo';
import {Calendario} from '../../components/calendario/calendario';
import {Footer} from '../../components/footer/footer';
import {Ubicacion} from '../../components/ubicacion/ubicacion';

@Component({
  selector: 'app-home',
  imports: [
    Navbar,
    Hero,
    Catalogo,
    Calendario,
    Footer,
    Ubicacion
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
