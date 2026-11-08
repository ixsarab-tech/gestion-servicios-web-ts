export interface ConfiguracionSeed {
  clave: string;
  valor: string;
}

/**
 * Configuración por defecto que se aplica a cada tenant.
 * Puede sobrescribirse vía el módulo de configuración.
 */
export const CONFIGURACION_DEFAULT: ConfiguracionSeed[] = [
  { clave: 'moneda', valor: 'NIO' },
  { clave: 'zona_horaria', valor: 'America/Managua' },
  { clave: 'formato_folio', valor: '{TENANT}-{YYYY}-{SEQ:6}' },
  { clave: 'iva_porcentaje', valor: '15.00' },
  { clave: 'tasa_municipal_porcentaje', valor: '1.00' },
  { clave: 'dias_garantia_default', valor: '90' },
  { clave: 'sla_horas_diagnostico', valor: '48' },
  { clave: 'sla_horas_presupuesto', valor: '24' },
  { clave: 'idioma', valor: 'es-NI' },
  { clave: 'pais', valor: 'NI' },
];

/**
 * Configuración específica por tenant (sobrescribe la default).
 */
export const CONFIGURACION_POR_TENANT: Record<string, ConfiguracionSeed[]> = {
  'taller-demo': [
    { clave: 'whatsapp_numero', valor: '+50588881000' },
    { clave: 'email_contacto', valor: 'contacto@taller-demo.ni' },
    { clave: 'direccion', valor: 'Managua, Nicaragua' },
  ],
  'taller-norte': [
    { clave: 'whatsapp_numero', valor: '+50588882000' },
    { clave: 'email_contacto', valor: 'contacto@taller-norte.ni' },
    { clave: 'direccion', valor: 'Estelí, Nicaragua' },
  ],
  'taller-sur': [
    { clave: 'whatsapp_numero', valor: '+50588883000' },
    { clave: 'email_contacto', valor: 'contacto@taller-sur.ni' },
    { clave: 'direccion', valor: 'Rivas, Nicaragua' },
  ],
};
