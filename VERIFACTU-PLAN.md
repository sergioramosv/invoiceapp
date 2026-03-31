# VeriFactu - Plan de implementacion

## Fases

### Fase 1: Modelo de datos (Foundation)
- Extender `Invoice` con: invoiceType, invoiceSeries, verifactuHash, verifactuPreviousHash, verifactuStatus, vatBreakdown[], emittedAt, campos rectificativa
- Extender `InvoiceState` con: multi-rate VAT (vatLines + vatLineId en items), invoiceType
- Actualizar converter y funciones de calculo
- Backward compatible: campos opcionales, facturas antiguas siguen funcionando

### Fase 2: Servicios core VeriFactu
- Hash SHA-256 encadenado (`src/lib/verifactu/hash.ts`)
- XML SOAP builder (`src/lib/verifactu/soap.ts`)
- Cliente AEAT stub (`src/lib/verifactu/client.ts`)
- QR generator (`src/lib/verifactu/qr.ts`)
- API route `/api/verifactu/emit` (flujo de emision)

### Fase 3: UI - Multi-rate IVA + tipo factura + emision
- Selector tipo factura (F1, F2, R1-R5)
- Tabla de items con columna IVA por linea
- Desglose IVA en totales y preview
- Boton "Emitir" separado de "Guardar"
- Bloqueo de edicion para facturas emitidas
- QR en preview/PDF
- Badge estado VeriFactu en lista

### Fase 4: PDF con QR + desglose IVA
- QR se renderiza en InvoicePreview, se captura automaticamente en PDF
- Verificar que html-to-image captura bien el QR

### Fase 5: Cola de reintentos + settings + i18n
- Retry queue con backoff exponencial
- Seccion VeriFactu en settings
- Traducciones ES/EN completas
