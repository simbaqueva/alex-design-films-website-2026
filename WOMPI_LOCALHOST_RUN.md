# 🚀 Solución Sin Instalación: localhost.run

## 📋 Resumen

**localhost.run** es un servicio que crea un túnel SSH hacia tu localhost, dándote una URL HTTPS pública **sin instalar nada**.

## ✅ Ventajas

- ✅ No requiere instalación (usa SSH que ya tienes)
- ✅ HTTPS automático
- ✅ Funciona con Widget de Wompi
- ✅ Permite webhooks
- ✅ Gratuito
- ✅ Funciona en Windows, Mac y Linux

## 🚀 Uso Rápido

### 1. Asegúrate de que tu servidor esté corriendo

```powershell
# En una terminal
python server.py
```

Deberías ver:
```
🚀 Servidor SPA Optimizado
📡 Puerto: 8000
🌐 URL: http://localhost:8000
```

### 2. Abre otra terminal y ejecuta

```powershell
ssh -R 80:localhost:8000 nokey@localhost.run
```

### 3. Obtendrás una URL HTTPS

Verás algo como:
```
Connect to http://abc123.lhr.life or https://abc123.lhr.life
```

### 4. Usa esa URL en tu navegador

En lugar de `http://localhost:8000`, usa `https://abc123.lhr.life`

## 🎯 Configurar Wompi con la URL

Actualiza tu configuración de Wompi:

```javascript
const wompi = initializeWompi({
    publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAqZlX8xnTxh',
    sandbox: true,
    redirectUrl: 'https://abc123.lhr.life/confirmacion' // Usa tu URL de localhost.run
});
```

## 📝 Notas Importantes

### ⚠️ La URL Cambia Cada Vez

Cada vez que ejecutes el comando SSH, obtendrás una URL diferente. Esto es normal.

### 🔄 Mantener la Conexión Activa

- No cierres la terminal donde ejecutaste el comando SSH
- Si la cierras, la URL dejará de funcionar
- Simplemente vuelve a ejecutar el comando para obtener una nueva URL

### 🐛 Si Obtienes Error de SSH

Si Windows no tiene SSH habilitado:

```powershell
# Verificar si SSH está disponible
ssh -V
```

Si no está instalado:
```powershell
# Instalar OpenSSH (requiere permisos de administrador)
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

## 🆚 Comparación con Otras Soluciones

| Característica | localhost.run | CORS Anywhere | ngrok |
|----------------|---------------|---------------|-------|
| Instalación | ✅ Ninguna | ✅ Ninguna | ❌ Requiere descarga |
| HTTPS | ✅ Sí | ❌ No | ✅ Sí |
| Widget Wompi | ✅ Funciona | ❌ No funciona | ✅ Funciona |
| Webhooks | ✅ Funciona | ❌ No funciona | ✅ Funciona |
| Gratis | ✅ Sí | ✅ Sí | ⚠️ Limitado |
| URL Personalizada | ❌ No | N/A | ⚠️ Solo plan pago |

## 🎓 Ejemplo Completo

### Terminal 1: Servidor Python
```powershell
cd c:\Users\janus\Downloads\sitio_web_oficial_alex_design_films
python server.py
```

### Terminal 2: Túnel SSH
```powershell
ssh -R 80:localhost:8000 nokey@localhost.run
```

Salida esperada:
```
** your connection id is abc123-def456-ghi789, please mention it if you send me a message about an issue. **

abc123.lhr.life tunneled with tls termination, https://abc123.lhr.life
```

### Navegador
Abre: `https://abc123.lhr.life`

## 🔧 Troubleshooting

### Error: "Connection refused"

Asegúrate de que `server.py` esté corriendo en el puerto 8000.

### Error: "Permission denied"

Verifica que SSH esté instalado:
```powershell
ssh -V
```

### La página no carga

1. Verifica que ambas terminales estén abiertas
2. Verifica que la URL sea la correcta (la que te dio localhost.run)
3. Asegúrate de usar `https://` no `http://`

## 🎉 Resultado Final

Ahora podrás:
- ✅ Usar el Widget de Wompi
- ✅ Procesar pagos de prueba
- ✅ Recibir webhooks (si los configuras)
- ✅ Todo sin instalar nada

## 📚 Recursos

- [localhost.run Documentación](https://localhost.run/docs/)
- [Wompi Documentación](https://docs.wompi.co/)

---

**¿Necesitas ayuda?** Asegúrate de que ambas terminales estén corriendo y usa la URL HTTPS que te proporciona localhost.run.
