const { test, expect, request } = require('@playwright/test');

// Función para detectar datos nulos o vacíos y contar su número
function findNullOrEmptyValues(obj, path = '') {
    const nullOrEmptyValues = [];
    let nullOrEmptyCount = 0; // Inicializar contador

    // Función recursiva para recorrer el objeto
    function checkValue(value, keyPath) {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || Number.isNaN(value)) {
            nullOrEmptyValues.push(keyPath);
            nullOrEmptyCount++; // Incrementar contador cuando se encuentra un campo nulo o vacío
        } else if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                checkValue(value[key], `${keyPath}.${key}`);
            }
        }
    }

    // Comienza a revisar desde la raíz del objeto
    checkValue(obj, path);

    return { nullOrEmptyValues, nullOrEmptyCount }; // Devolver lista y contador
}

test('Api Test: carga-asesores-activos-por-agencia', async () => {
    // Configurar el contexto de la solicitud API
    const apiContext = await request.newContext({
        baseURL: 'https://api.qa.epicentro-digital.com', // URL base de la API
        extraHTTPHeaders: {
            'Authorization': 'Bearer 208|2NfIIv0DWcjer5p2E7Htu7Z2l3F8WGUOggr9zKub', // Header de autorización
        },
    });

    // Registrar el tiempo de inicio
    const startTime = Date.now();

    // Realizar la solicitud GET
    const response = await apiContext.get('/api/LogisticaCRM');
    const responseBody = await response.json(); // Convertir la respuesta a formato JSON

    // Registrar el tiempo de finalización
    const endTime = Date.now();
    const responseTime = endTime - startTime; // Calcular el tiempo de respuesta

    // Imprimir el código de respuesta
    console.log(`Código de respuesta: ${response.status()}`);

    // Imprimir el tiempo de respuesta
    console.log(`Tiempo de respuesta: ${responseTime} ms`);

    // Acceder al array de la respuesta y mostrar objetos completos
    if (Array.isArray(responseBody)) {
        console.log('Array en la respuesta:', JSON.stringify(responseBody, null, 2));
    } else if (responseBody && Array.isArray(responseBody.data)) {
        console.log('Array en responseBody.data:', JSON.stringify(responseBody.data, null, 2));
    } else {
        console.log('No se encontró un array en la respuesta.');
    }

    // Buscar y enumerar datos nulos o vacíos
    const { nullOrEmptyValues, nullOrEmptyCount } = findNullOrEmptyValues(responseBody);
    if (nullOrEmptyValues.length > 0) {
        console.log('Campos nulos o vacíos encontrados:', nullOrEmptyValues.join(', '));
        console.log(`Total de campos nulos o vacíos: ${nullOrEmptyCount}`);
    } else {
        console.log('No se encontraron campos nulos o vacíos.');
    }

    // Verificar el código de estado
    expect(response.status()).toBe(200);

    // Cerrar el contexto de la solicitud API
    await apiContext.dispose();
});
