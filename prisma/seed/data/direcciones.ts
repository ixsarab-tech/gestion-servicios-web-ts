/**
 * Direcciones de prueba para los clientes existentes.
 * Los clientes se localizan por email (o por nombre+apellidos si no tiene email).
 */
export interface DireccionSeed {
  clienteEmail?: string;
  clienteNombre?: string;
  clienteApellidos?: string;
  etiqueta: string;
  calle: string;
  ciudad: string;
  departamento: string;
  pais: string;
  codigoPostal?: string;
  referencias?: string;
  esPrincipal: boolean;
}

export const DIRECCIONES: DireccionSeed[] = [
  // ─── Juan Pérez (admin23456@aduana.com) ───
  {
    clienteEmail: 'admin23456@aduana.com',
    etiqueta: 'Casa',
    calle: 'Frente al Parque Central, Casa #123',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    codigoPostal: '11001',
    referencias: 'Portón negro, timbre a la derecha',
    esPrincipal: true,
  },
  {
    clienteEmail: 'admin23456@aduana.com',
    etiqueta: 'Oficina',
    calle: 'Km 5 Carretera Sur, Edificio Central, Piso 2',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    referencias: 'Preguntar por recepción',
    esPrincipal: false,
  },
  {
    clienteEmail: 'admin23456@aduana.com',
    etiqueta: 'Casa de veraneo',
    calle: 'Playa Pochomil, Km 62 Carretera Nueva a León',
    ciudad: 'San Rafael del Sur',
    departamento: 'Managua',
    pais: 'NI',
    esPrincipal: false,
  },

  // ─── Jostin (jorge.prado67899@clinica.com) ───
  {
    clienteEmail: 'jorge.prado67899@clinica.com',
    etiqueta: 'Casa',
    calle: 'Barrio Los Robles, Casa #45',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    esPrincipal: true,
  },
  {
    clienteEmail: 'jorge.prado67899@clinica.com',
    etiqueta: 'Trabajo',
    calle: 'Plaza España, Módulo 3',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    referencias: 'Frente a la farmacia',
    esPrincipal: false,
  },

  // ─── Carlos Jimenez (sin email) ───
  {
    clienteNombre: 'Carlos',
    clienteApellidos: 'Jimenez',
    etiqueta: 'Casa',
    calle: 'Colonia Centroamérica, Casa #78',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    esPrincipal: true,
  },

  // ─── Jose Jimenez (sin email) ───
  {
    clienteNombre: 'Jose',
    clienteApellidos: 'Jimenez',
    etiqueta: 'Casa',
    calle: 'Reparto San Juan, Casa #12',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    esPrincipal: true,
  },

  // ─── Maria Jose (sin email) ───
  {
    clienteNombre: 'Maria',
    clienteApellidos: 'Jose',
    etiqueta: 'Casa',
    calle: 'Villa Fontana, Casa #99',
    ciudad: 'Managua',
    departamento: 'Managua',
    pais: 'NI',
    esPrincipal: true,
  },
];
