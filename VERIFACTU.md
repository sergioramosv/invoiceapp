# VeriFactu — Guía completa de implementación para InvoiceApp

## 1. ¿Qué es VeriFactu?

VeriFactu (VERI*FACTU) es el sistema de la Agencia Tributaria (AEAT) que obliga a que **todo software de facturación en España** registre cada factura de forma inmutable, trazable y verificable. Regulado por el **Real Decreto 1007/2023** y la Orden HAC/1177/2024.

### Fechas clave
- **1 enero 2027** — Obligatorio para sociedades (S.L., S.A.)
- **1 julio 2027** — Obligatorio para autónomos
- **Ahora mismo** — Voluntario, la AEAT ya tiene entornos de prueba

### ¿A quién afecta?
A **todo software de facturación** que opere en España, incluyendo SaaS como InvoiceApp. Si un usuario español emite facturas con nuestra app, estamos obligados a cumplir.

---

## 2. Dos modalidades de cumplimiento

### Opción A: Sistema VeriFactu (recomendada)
- Envío **automático e inmediato** de cada factura a la AEAT vía web service SOAP
- La AEAT valida los datos y la cadena de hashes
- **No requiere** firma electrónica avanzada del usuario
- **No requiere** registro de eventos local
- Es la opción más simple para un SaaS

### Opción B: Sistema No VeriFactu
- No envía datos a la AEAT automáticamente
- Requiere **firma electrónica** de cada registro con certificado digital
- Requiere **registro de eventos** local (log de auditoría)
- La AEAT puede pedir los datos en una inspección
- Más complejo de implementar

**Recomendación para InvoiceApp: Opción A (VeriFactu)** — es más simple y transparente.

---

## 3. Requisitos técnicos detallados

### 3.1. Hash encadenado SHA-256

Cada factura genera un hash único calculado sobre estos campos **concatenados con `|`**:

```
NIF_emisor | NumSerieFactura | FechaExpedicion | TipoFactura | CuotaTotal | ImporteTotal | Huella_anterior
```

- **Algoritmo**: SHA-256 (produce hash hexadecimal de 64 caracteres)
- **Primera factura**: el campo `Huella_anterior` está vacío
- **Siguientes**: incluyen el hash de la factura inmediatamente anterior
- **Resultado**: cadena inmutable — si alguien modifica una factura intermedia, todos los hashes posteriores se rompen

**Ejemplo:**
```
B12345678|FAC-2026-001|2026-06-15|F1|210.00|1210.00|
→ SHA-256 → a3f2b7c9d1e4...

B12345678|FAC-2026-002|2026-06-16|F1|42.00|242.00|a3f2b7c9d1e4...
→ SHA-256 → 7e8f1a2b3c4d...
```

### 3.2. Formato XML SOAP

Los registros se envían como XML SOAP al web service de la AEAT. Estructura:

```xml
<soapenv:Envelope>
  <soapenv:Body>
    <sum:AltaFactuSistemaFacturacion>
      <sum1:Cabecera>
        <sum1:IDVersion>1.0</sum1:IDVersion>
        <sum1:ObligadoEmision>
          <sum1:NombreRazon>Nombre Empresa</sum1:NombreRazon>
          <sum1:NIF>B12345678</sum1:NIF>
        </sum1:ObligadoEmision>
      </sum1:Cabecera>
      <sum:RegistroAltaFacturas>
        <sum:RegistroFacturacion>
          <!-- Identificación factura -->
          <sum1:IDFactura>
            <sum1:IDEmisorFactura><sum1:NIF>B12345678</sum1:NIF></sum1:IDEmisorFactura>
            <sum1:NumSerieFacturaEmisor>FAC-2026-001</sum1:NumSerieFacturaEmisor>
            <sum1:FechaExpedicionFacturaEmisor>15-06-2026</sum1:FechaExpedicionFacturaEmisor>
          </sum1:IDFactura>

          <!-- Tipo de factura -->
          <sum1:TipoFactura>F1</sum1:TipoFactura>
          <sum1:DescripcionOperacion>Servicios profesionales</sum1:DescripcionOperacion>

          <!-- Destinatario -->
          <sum1:Destinatarios>
            <sum1:IDDestinatario>
              <sum1:NombreRazon>Cliente S.L.</sum1:NombreRazon>
              <sum1:NIF>A87654321</sum1:NIF>
            </sum1:IDDestinatario>
          </sum1:Destinatarios>

          <!-- Desglose IVA (OBLIGATORIO por tipo impositivo) -->
          <sum1:Desglose>
            <sum1:DetalleDesglose>
              <sum1:ClaveRegimen>01</sum1:ClaveRegimen>
              <sum1:CalificacionOperacion>S1</sum1:CalificacionOperacion>
              <sum1:TipoImpositivo>21</sum1:TipoImpositivo>
              <sum1:BaseImponibleOimporteNoSujeto>1000.00</sum1:BaseImponibleOimporteNoSujeto>
              <sum1:CuotaRepercutida>210.00</sum1:CuotaRepercutida>
            </sum1:DetalleDesglose>
          </sum1:Desglose>

          <sum1:ImporteTotal>1210.00</sum1:ImporteTotal>

          <!-- Encadenamiento con factura anterior -->
          <sum1:EncadenamientoRegistroAnterior>
            <sum1:IDEmisorFacturaRegistroAnterior>
              <sum1:NIF>B12345678</sum1:NIF>
            </sum1:IDEmisorFacturaRegistroAnterior>
            <sum1:NumSerieFacturaRegistroAnterior>FAC-2025-047</sum1:NumSerieFacturaRegistroAnterior>
            <sum1:FechaExpedicionFacturaRegistroAnterior>10-06-2026</sum1:FechaExpedicionFacturaRegistroAnterior>
            <sum1:HuellaRegistroAnterior>a3f2b7c9d1e4...</sum1:HuellaRegistroAnterior>
          </sum1:EncadenamientoRegistroAnterior>

          <!-- Identificación del software -->
          <sum1:SistemaInformatico>
            <sum1:NombreRazon>SRSoftware</sum1:NombreRazon>
            <sum1:NIF>...</sum1:NIF>
            <sum1:NombreSistemaInformatico>InvoiceApp</sum1:NombreSistemaInformatico>
            <sum1:IdSistemaInformatico>001</sum1:IdSistemaInformatico>
            <sum1:Version>1.0.0</sum1:Version>
            <sum1:NumeroInstalacion>001</sum1:NumeroInstalacion>
            <sum1:TipoUsoPosibleSoloVerifactu>S</sum1:TipoUsoPosibleSoloVerifactu>
            <sum1:TipoUsoPosibleOtros>N</sum1:TipoUsoPosibleOtros>
            <sum1:TipoUsoPosibleMultiOT>S</sum1:TipoUsoPosibleMultiOT>
          </sum1:SistemaInformatico>

          <!-- Timestamp -->
          <sum1:FechaGenRegistro>15-06-2026</sum1:FechaGenRegistro>
          <sum1:HoraGenRegistro>14:30:00</sum1:HoraGenRegistro>
          <sum1:HusoHorarioGenRegistro>02</sum1:HusoHorarioGenRegistro>
        </sum:RegistroFacturacion>

        <!-- Hash de este registro -->
        <sum:DatosControl>
          <sum1:Huella>7e8f1a2b3c4d...</sum1:Huella>
          <sum1:TipoHash>01</sum1:TipoHash>
        </sum:DatosControl>
      </sum:RegistroAltaFacturas>
    </sum:AltaFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>
```

### 3.3. Código QR obligatorio

Cada factura impresa/PDF debe incluir un QR con:
- URL a la sede electrónica de la AEAT
- NIF emisor
- Número de factura
- Importe total
- Permite al receptor **verificar** la factura directamente con Hacienda

### 3.4. Tipos de factura

| Código | Tipo | Descripción |
|--------|------|-------------|
| F1 | Factura completa | Factura estándar con todos los datos |
| F2 | Factura simplificada (ticket) | Sin datos del destinatario (< 400€) |
| F3 | Factura emitida como sustitución de simplificada | |
| R1 | Factura rectificativa (art. 80.1-2) | Corrección de error |
| R2 | Factura rectificativa (art. 80.3) | Crédito incobrable |
| R3 | Factura rectificativa (art. 80.4) | Concurso acreedor |
| R4 | Factura rectificativa (otros) | |
| R5 | Factura rectificativa simplificada | |

### 3.5. Claves de régimen IVA

| Código | Régimen |
|--------|---------|
| 01 | Régimen general |
| 02 | Exportación |
| 03 | Bienes usados |
| 04 | Objetos de arte |
| 05 | Inversión sujeto pasivo |
| 06 | Régimen simplificado |
| 07 | REAGYP |
| 08 | IGIC / IPSI |

### 3.6. Calificación de operaciones

| Código | Tipo |
|--------|------|
| S1 | Sujeta - No exenta (regla general) |
| S2 | Sujeta - No exenta (inversión sujeto pasivo) |
| E1-E6 | Exenta (varios motivos) |
| N1-N2 | No sujeta |

---

## 4. ¿Qué necesitamos hacer NOSOTROS (InvoiceApp)?

### 4.1. Cambios en el modelo de datos

- **Separar serie y número** de factura (actualmente es un solo campo `invoiceNumber`)
- **Añadir tipo de factura** (F1, F2, R1, etc.)
- **Desglose IVA por tipo impositivo** (no solo un % global, sino agrupado: 21%, 10%, 4%, exento)
- **Hash SHA-256** almacenado en cada factura
- **Hash de la factura anterior** referenciado
- **Timestamp** exacto de generación del registro (fecha + hora + huso horario)
- **Estado VeriFactu**: pendiente, enviado, aceptado, rechazado
- **QR data**: datos para generar el QR

### 4.2. Servicios nuevos a implementar

1. **Hash Service** — Genera SHA-256 encadenado al guardar/emitir factura
2. **XML Builder** — Construye el XML SOAP conforme al schema AEAT
3. **AEAT Client** — Envía el XML al web service de la AEAT (HTTPS con certificado)
4. **QR Generator** — Genera código QR con datos de verificación
5. **Bloqueo de edición** — Facturas enviadas no se pueden modificar (solo anular/rectificar)
6. **Factura rectificativa** — Flujo para corregir facturas ya enviadas

### 4.3. Nuevas páginas/UI

- Selector de tipo de factura al crear (F1, F2)
- Desglose IVA visual (base + cuota por tipo)
- Indicador de estado VeriFactu en cada factura
- QR visible en la preview/PDF de la factura
- Opción "Emitir" que envía a la AEAT (distinto de "Guardar borrador")
- Panel de estado de envíos a la AEAT (aceptados, rechazados, pendientes)

---

## 5. ¿Qué necesitamos hacer EXTERNAMENTE?

### 5.1. Registro como fabricante de software

**OBLIGATORIO** — SRSoftware debe darse de alta como fabricante de software de facturación ante la AEAT mediante declaración responsable.

- Formulario: Modelo 036/037 (pendiente de publicación del modelo específico)
- Datos: nombre software, versión, NIF fabricante
- La AEAT asigna un **ID de sistema informático** que se incluye en cada XML

### 5.2. Certificado digital

Para enviar datos a la AEAT se necesita:
- **Certificado digital de la empresa** (SRSoftware) o del usuario
- Opciones: FNMT (gratuito), certificado de representante
- Se usa para firmar las peticiones HTTPS al web service

**Nota**: En modo VeriFactu (Opción A), NO es necesario que cada usuario tenga certificado. El software (InvoiceApp) puede enviar con su propio certificado como intermediario.

### 5.3. Entorno de pruebas AEAT

La AEAT ofrece un entorno de pruebas (staging):
- URL distinta a producción
- Permite probar envíos sin efecto fiscal real
- Debemos probarlo ANTES de ir a producción

### 5.4. Auditoría / Certificación

Actualmente NO se requiere una certificación formal del software, pero:
- El RD obliga a una **declaración responsable** del fabricante
- La AEAT puede inspeccionar el software en cualquier momento
- Debemos poder demostrar que cumplimos todos los requisitos técnicos

---

## 6. ¿Qué NO necesitamos hacer?

- **No** necesitamos implementar TicketBAI (es el equivalente vasco, distinto de VeriFactu)
- **No** necesitamos factura electrónica B2B (eso es la Ley Crea y Crece, normativa separada)
- **No** necesitamos SII (Suministro Inmediato de Información) — es para grandes empresas (>6M€)
- **No** necesitamos certificar el software ante un organismo externo (solo declaración responsable)
- **No** necesitamos que el usuario final tenga certificado digital (en modo VeriFactu)

---

## 7. Riesgos y consideraciones

### Sanciones por incumplimiento
- Hasta **50.000€ por ejercicio** por usar software no conforme
- Hasta **150.000€** para el fabricante del software

### Consideraciones técnicas
- El hash chain significa que **no se puede borrar ni modificar** una factura emitida
- Las rectificativas crean un NUEVO registro que referencia al original
- El envío a la AEAT debe ser **inmediato** (al emitir la factura)
- Si falla el envío, debe reintentarse automáticamente
- Necesitamos un **log/cola de envíos** para gestionar reintentos

### Impacto en UX
- El usuario ya no puede "editar" una factura emitida — solo anularla y crear nueva
- Se necesita un paso explícito "Emitir" diferente de "Guardar borrador"
- El QR aparecerá obligatoriamente en todas las facturas

---

## 8. Cronograma sugerido de implementación

| Fase | Tarea | Estimación |
|------|-------|------------|
| 1 | Modelo de datos (serie, tipo factura, desglose IVA, hash) | 1 sprint |
| 2 | Hash Service SHA-256 encadenado | 1 sprint |
| 3 | XML Builder conforme a schema AEAT | 1 sprint |
| 4 | QR Generator + integración en preview/PDF | 0.5 sprint |
| 5 | AEAT Client (envío SOAP + certificado + reintentos) | 1 sprint |
| 6 | UI: tipo factura, desglose IVA, estado envío, bloqueo edición | 1 sprint |
| 7 | Registro como fabricante + certificado digital | Trámite administrativo |
| 8 | Testing en entorno AEAT staging | 1 sprint |
| **Total** | | **~6 sprints** |

---

## 9. Referencias

- [AEAT — Sistemas VeriFactu (oficial)](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html)
- [AEAT — FAQ Hash/Huella](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/huella-hash.html)
- [AEAT — FAQ Registros de alta](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/registros-facturacion-alta.html)
- [Real Decreto 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840)
- [Orden HAC/1177/2024](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138)
- [B2Brouter — Ejemplo XML](https://www.b2brouter.net/es/ejemplo-xml-verifactu/)
- [Factibo — Hash VeriFactu](https://www.factibo.com/blog/que-es-hash-verifactu)
