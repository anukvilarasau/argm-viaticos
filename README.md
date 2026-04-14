# Configuracion del agente de viaticos

Este workspace quedo preparado con la configuracion base del agente "Asistente de Viaticos de Argenteo Mining".

## Archivos incluidos
- [argenteo_viaticos_agent.md](/Users/anukvilarasau/Documents/New%20project/argenteo_viaticos_agent.md): prompt completo del sistema, flujo operativo, manejo de errores y mensaje inicial.
- [google_sheets_config.json](/Users/anukvilarasau/Documents/New%20project/google_sheets_config.json): parametros exactos de Google Sheets y mapeo de columnas.

## Uso recomendado
1. Copia el contenido de `argenteo_viaticos_agent.md` en el campo de instrucciones del agente o asistente que vayan a usar.
2. Configura la accion o integracion de Google Sheets con los valores definidos en `google_sheets_config.json`.
3. Verifica que la hoja de destino se llame exactamente `Control de Viáticos - Argenteo Mining SA`.
4. Inicia el agente con el mensaje inicial ya incluido en el prompt.

## Credenciales en produccion
Para Vercel u otros despliegues, puedes configurar Google Sheets de dos formas:
- Opcion recomendada: una sola variable `GOOGLE_SERVICE_ACCOUNT_JSON` con el JSON completo de la cuenta de servicio.
- Opcion alternativa: `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_PRIVATE_KEY`.

## Mensaje de inicio
He cargado la configuracion del agente de viaticos de Argenteo Mining SA y los parametros de Google Sheets para la hoja "Control de Viáticos - Argenteo Mining SA". Estoy listo para procesar imagenes o archivos adjuntos y registrar la informacion automaticamente. Puedes enviarme el primer comprobante para "Control de Viáticos - Argenteo Mining SA 2".
