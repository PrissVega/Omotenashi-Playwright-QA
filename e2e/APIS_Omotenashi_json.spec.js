const { test, expect } = require('@playwright/test');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://api.qa.epicentro-digital.com';
const TOKEN = '214|kocvVV8hq63n9bfpKkJjadPv5azEpNuLIJOFj9XB';
const EXPECTED_STATUS_CODE = 200;
const POST_ID_FILE = path.join(__dirname, 'postId.json');

let postId; // Variable global para almacenar el postId

function createFormData(params) {
  const formData = new FormData();
  const filePath = 'C:\\Users\\crm_2\\Downloads\\repository-open-graph-template.png';
  if (fs.existsSync(filePath)) {
    formData.append('files[]', fs.createReadStream(filePath));
  } else {
    console.error('El archivo no existe:', filePath);
  }
  
  if (params.tipo) formData.append('tipo', params.tipo);
  if (params.campania) formData.append('campania', params.campania);
  if (params.descripcion) formData.append('descripcion', params.descripcion);
  if (params.usuId) formData.append('usuId', params.usuId);
  if (params.anonimo) formData.append('anonimo', params.anonimo);
  if (params.appId) formData.append('appId', params.appId);
  if (params.usuarios) formData.append('usuarios[]', JSON.stringify(params.usuarios));
  if (params.postId) formData.append('postId', params.postId);
  if (params.idReaccion) formData.append('idReaccion', params.idReaccion);

  return formData;
}

async function postData(endpoint, formData) {
  try {
    const start = Date.now();
    const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });
    const responseTime = Date.now() - start;
    return { response, responseTime };
  } catch (error) {
    if (error.response) {
      console.error('Error en la respuesta de la API:', error.response.status, error.response.statusText);
      console.error('Detalles del error:', error.response.data);
      console.error('Headers de la respuesta:', error.response.headers);
      console.error('Configuración de la solicitud:', error.config);
    } else if (error.request) {
      console.error('Error en la solicitud de la API:', error.request);
    } else {
      console.error('Error en la configuración de la solicitud:', error.message);
    }
    throw error;
  }
}

test('Api Test: savePost', async () => {
  const formData = createFormData({
    tipo: '467',
    campania: '453',
    descripcion: 'pruebas de post nuevo omotenashiwwwwww',
    usuId: '1',
    anonimo: '0',
    appId: '1679091c5a880faf6fb5e6087eb1b2dc',
    usuarios: [{ usuIdEt: 1 }, { usuIdEt: 2 }, { usuIdEt: 3 }],
  });

  const endpoint = '/api/savePost/save';
  try {
    const { response, responseTime } = await postData(endpoint, formData);

    console.log('Status Code:', response.status);
    console.log('Response Time (ms):', responseTime);
    console.log('Response from API:', response.data);

    expect(response.status).toBe(EXPECTED_STATUS_CODE);
    expect(response.data).toHaveProperty('data');

    // Guarda el postId creado para usarlo en otros tests
    postId = response.data.data[0]?.post_id;
    if (!postId) {
      throw new Error('No se pudo obtener postId.');
    }
    fs.writeFileSync(POST_ID_FILE, JSON.stringify({ postId }));
    console.log('postId guardado en archivo:', postId); // Mensaje de depuración
  } catch (error) {
    console.error('Error durante la prueba savePost:', error.message);
  }
});

test('Api Test: savePost_all', async () => {
  const formData = createFormData({
    appId: '1679091c5a880faf6fb5e6087eb1b2dc',
    usuId: '1',
  });

  const endpoint = '/api/savePost/all';
  try {
    const { response, responseTime } = await postData(endpoint, formData);

    console.log('Status Code:', response.status);
    console.log('Response Time (ms):', responseTime);
    console.log('Response from API:', response.data.data);

    expect(response.status).toBe(EXPECTED_STATUS_CODE);
    expect(response.data).toHaveProperty('data');
  } catch (error) {
    console.error('Error durante la prueba savePost_all:', error.message);
  }
});

test('Api Test: saveReaction', async () => {
  if (!fs.existsSync(POST_ID_FILE)) {
    console.error('postId no está disponible.');
    return;
  }

  // Lee el archivo temporal antes de la prueba
  const data = JSON.parse(fs.readFileSync(POST_ID_FILE, 'utf8'));
  postId = data.postId;

  if (!postId) {
    console.error('postId no está definido en el archivo.');
    return;
  }

  const formData = createFormData({
    appId: '1679091c5a880faf6fb5e6087eb1b2dc',
    postId: postId,  // Usa el postId creado
    idReaccion: '466',
    usuId: '1',
  });

  const endpoint = '/api/saveReaccion/save';
  try {
    const { response, responseTime } = await postData(endpoint, formData);

    console.log('Status Code:', response.status);
    console.log('Response Time (ms):', responseTime);
    console.log('Response from API:', response.data);

    expect(response.status).toBe(EXPECTED_STATUS_CODE);
    expect(response.data).toHaveProperty('data');
  } catch (error) {
    console.error('Error durante la prueba saveReaction:', error.message);
  }
});

test('Api Test: saveEtiquetas', async () => {
  if (!fs.existsSync(POST_ID_FILE)) {
    console.error('postId no está disponible.');
    return;
  }

  // Lee el archivo temporal antes de la prueba
  const data = JSON.parse(fs.readFileSync(POST_ID_FILE, 'utf8'));
  postId = data.postId;

  if (!postId) {
    console.error('postId no está definido en el archivo.');
    return;
  }

  const requestData = {
    appId: '1679091c5a880faf6fb5e6087eb1b2dc',
    postId: postId,
    usuId: '1',
    usuarios: [{ usuIdEt: 1 }, { usuIdEt: 2 }],
  };

  const endpoint = '/api/saveEtiquetas/save';
  try {
    const { response, responseTime } = await postData(endpoint, requestData);

    console.log('Status Code:', response.status);
    console.log('Response Time (ms):', responseTime);
    console.log('Response from API:', response.data);

    expect(response.status).toBe(EXPECTED_STATUS_CODE);
    expect(response.data).toHaveProperty('data');
  } catch (error) {
    console.error('Error durante la prueba saveEtiquetas:', error.message);
  }
});

test('Api Test: deleteEtiquetas', async () => {
  if (!fs.existsSync(POST_ID_FILE)) {
    console.error('postId no está disponible.');
    return;
  }

  // Lee el archivo temporal antes de la prueba
  const data = JSON.parse(fs.readFileSync(POST_ID_FILE, 'utf8'));
  postId = data.postId;

  if (!postId) {
    console.error('postId no está definido en el archivo.');
    return;
  }

  const requestData = {
    appId: '1679091c5a880faf6fb5e6087eb1b2dc', // Verifica que este appId sea correcto
    postId: postId,  // Usa el postId creado
    etiqId: '11',
  };

  const endpoint = '/api/saveEtiquetas/delete';
  try {
    const { response, responseTime } = await postData(endpoint, requestData);

    console.log('Status Code:', response.status);
    console.log('Response Time (ms):', responseTime);
    console.log('Response from API:', response.data);

    expect(response.status).toBe(EXPECTED_STATUS_CODE);
    expect(response.data).toHaveProperty('data');
  } catch (error) {
    console.error('Error durante la prueba saveEtiquetas:', error.message);
  }
});