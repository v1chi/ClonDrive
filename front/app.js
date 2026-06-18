const API_URL = 'http://localhost:3001/api/files';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const filesList = document.getElementById('files-list');
const uploadingState = document.getElementById('uploading-state');

// Evitar comportamientos por defecto del navegador
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Efectos visuales al arrastrar encima
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

// Manejar el archivo soltado
dropZone.addEventListener('drop', handleDrop, false);

// Manejar click en el botón (por si no quieren arrastrar)
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        uploadFile(this.files[0]);
    }
});

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// Función para subir el archivo
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Mostrar estado de carga
    uploadingState.classList.remove('hidden');
    dropZone.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error subiendo archivo');

        // Recargar la lista automáticamente
        await fetchFiles();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error subiendo el archivo');
    } finally {
        // Volver a mostrar la zona de arrastre
        uploadingState.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
    }
}

// Función para obtener y mostrar los archivos
async function fetchFiles() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error conectando al servidor');

        const files = await response.json();
        renderFiles(files);
    } catch (error) {
        console.error('Error:', error);
        filesList.innerHTML = '<p style="color:var(--secondary-color); text-align:center;">No se pudo cargar la lista</p>';
    }
}

// Utilidad para formatear el peso (ej. 1048576 -> 1 MB)
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Renderizar la lista de archivos en el HTML
function renderFiles(files) {
    if (files.length === 0) {
        filesList.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">No hay archivos</p>';
        return;
    }

    filesList.innerHTML = files.map(file => {
        // Formatear la fecha
        const date = new Date(file.last_modified).toLocaleString();

        return `
            <div class="file-card">
                <div class="file-info">
                    <span class="file-name" title="${file.original_name}">${file.original_name}</span>
                    <span class="file-meta">${formatBytes(file.size)} • ${date}</span>
                </div>
                <a href="${API_URL}/download/${file.s3_key}" class="btn-download" download>
                    Descargar
                </a>
            </div>
        `;
    }).join('');
}

// Cargar la lista al iniciar la página
document.addEventListener('DOMContentLoaded', fetchFiles);
