export default {
  async fetch(request: Request) {

    const url = new URL(request.url);

    if (url.pathname === '/api/test') {
      return Response.json({
        ok: true,
        mensaje: 'API de Garridos Barber funcionando'
      });
    }

    return new Response(
      'Ruta API no encontrada',
      {
        status: 404
      }
    );
  }
};
