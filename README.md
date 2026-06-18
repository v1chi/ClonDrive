# ClonDrive — Taller LocalStack & Terraform

Un clon de Google Drive que permite subir, listar y descargar archivos utilizando LocalStack, Terraform y un backend en Python.

---

## Herramientas Utilizadas

- **Frontend:** HTML, CSS y JavaScript.
- **Backend:** Python.
- **Infraestructura:** LocalStack (emulando AWS S3).
- **Orquestación:** Docker Compose.
- **Infraestructura como Código (IaC):** Terraform.

---

## Requisitos Previos

Para poder replicar este proyecto en otro PC, necesitas tener instalado:

1. Docker Desktop (corriendo en segundo plano).
2. Terraform.
3. Python y pip.
4. Cuenta gratuita en LocalStack Web App para obtener el AUTH_TOKEN.

---

## Variables de Entorno

Antes de iniciar, debes configurar el archivo `.env` en la raíz del proyecto. Crea o edita el archivo `.env` con el siguiente contenido:

```env
LOCALSTACK_AUTH_TOKEN=tu_token_de_localstack_aqui

PORT=3001
S3_ENDPOINT=http://localhost:4566
S3_BUCKET=clondrive-files
AWS_REGION=us-east-1
```

---

## Pasos de Instalación y Ejecución

Sigue este flujo en orden:

### Paso 1: Levantar LocalStack
Abre una terminal en la raíz del proyecto y ejecuta Docker Compose para levantar el contenedor de LocalStack:
```bash
docker compose up -d
```
Espera unos segundos a que el contenedor inicie completamente.

### Paso 2: Crear la Infraestructura (S3) con Terraform
En una terminal, entra a la carpeta de Terraform y aplica la configuración para crear el bucket:
```bash
cd terraform
terraform init
terraform apply -auto-approve
cd ..
```

### Paso 3: Levantar el Backend
Abre otra terminal, entra a la carpeta del backend, instala las dependencias y ejecuta el servidor:
```bash
cd back
pip install -r requirements.txt
python app.py
```
El servidor quedará corriendo en `http://localhost:3001`

### Paso 4: Usar la Aplicación
1. Ve a la carpeta `front/`.
2. Haz doble clic en el archivo `index.html` para abrirlo en tu navegador web.
3. Arrastra y suelta un archivo, o haz clic en "O buscar en tu PC" para subir contenido a tu S3 local.
4. Verás la lista de los últimos 3 archivos subidos y podrás descargarlos.