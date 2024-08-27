const FormData = require('form-data');
const fs = require('fs');

async function performRequest(context, endpoint, formData, authorizationToken) {
  // Registrar el tiempo de inicio
  const start = Date.now();

  // Realizar la solicitud
  const response = await context.post(endpoint, {
    headers: {
      ...formData.getHeaders(), // Obtén los headers de formData
      'Authorization': `Bearer ${authorizationToken}`,
    },
    body: formData,
  });

  // Calcular el tiempo de respuesta
  const responseTime = Date.now() - start;

  // Obtener el cuerpo de la respuesta
  const responseBody = await response.json();

  // Imprimir los resultados
  console.log('Status Code:', response.status());
  console.log('Response Time (ms):', responseTime);
  console.log('Response from API:', responseBody);
  console.log('Response Fields:', Object.keys(responseBody));

  // Retornar la respuesta para realizar las validaciones
  return { response, responseBody };
}

module.exports = { performRequest };
