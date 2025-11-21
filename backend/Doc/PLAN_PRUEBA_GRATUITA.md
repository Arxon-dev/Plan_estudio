# Plan de Implementación: Prueba Gratuita de 7 Días

## Objetivo
Permitir a los nuevos usuarios probar el plan Premium gratis durante 7 días, asegurando que esta oferta solo esté disponible una vez por usuario.

## Análisis del Estado Actual
- **Backend:**
    - `User` model tiene `subscriptionStatus` que soporta 'trialing'.
    - `StripeService` maneja la creación de sesiones de checkout.
    - Falta un mecanismo para rastrear si un usuario YA ha usado su prueba gratuita anteriormente.
- **Frontend:**
    - Necesita mostrar la oferta de prueba solo a usuarios elegibles.

## Cambios Propuestos

### 1. Base de Datos (Backend)
- **Nueva Migración:** Añadir columna `hasUsedTrial` (boolean, default false) a la tabla `users`.
- **Modelo User:** Actualizar `User.ts` para incluir este nuevo campo.

### 2. Lógica de Negocio (Backend - StripeService)
- **Modificar `createCheckoutSession`:**
    - Verificar si `user.hasUsedTrial` es false Y si el usuario no ha tenido suscripción previa.
    - Si es elegible:
        - Añadir `subscription_data.trial_period_days: 7` a la configuración de la sesión de Stripe.
        - Marcar `hasUsedTrial = true` en la base de datos (o hacerlo al recibir el webhook de inicio de suscripción, pero marcarlo al iniciar el checkout es más seguro para evitar abusos de intentos múltiples, aunque lo ideal es al confirmar).
        - *Mejor enfoque:* Marcar `hasUsedTrial` cuando Stripe confirma que la suscripción (trial) ha comenzado via Webhook, O simplemente confiar en que si `hasUsedTrial` es false, le ofrecemos la prueba.
    - **Lógica de Elegibilidad:**
        - Usuario NO es premium actualmente.
        - `hasUsedTrial` es false.
        - (Opcional) Verificar historial de pagos en Stripe si queremos ser muy estrictos, pero el flag local es más rápido.

### 3. Webhooks (Backend)
- Asegurar que cuando llega `customer.subscription.created` o `updated` con status `trialing`, nuestro sistema lo maneje correctamente (ya parece hacerlo en `handleSubscriptionUpdated`).
- Cuando una suscripción pasa de `trialing` a `active`, actualizar el estado (ya cubierto).

### 4. Frontend
- Actualizar la interfaz de precios para destacar "7 días GRATIS" si el usuario es elegible.
- Pasar un indicador de elegibilidad desde el backend al frontend (ej. en el endpoint `/me` o `/auth/status`).

## Pasos de Ejecución

1.  **Crear Migración:** Añadir `hasUsedTrial` a `users`.
2.  **Actualizar Modelo:** `User.ts`.
3.  **Actualizar StripeService:**
    - Método `checkTrialEligibility(user)`.
    - Actualizar `createCheckoutSession` para inyectar `trial_period_days`.
4.  **Actualizar Webhook (Opcional):** Para marcar `hasUsedTrial` definitivamente cuando se activa.
5.  **Verificación:** Probar flujo de checkout con usuario nuevo vs usuario existente.

## Consideraciones de Seguridad
- Evitar que un usuario cree múltiples cuentas para abusar (difícil de prevenir totalmente sin verificación de teléfono/tarjeta, pero Stripe ya limita por tarjeta).
- La restricción principal será a nivel de cuenta de usuario en nuestra DB.
