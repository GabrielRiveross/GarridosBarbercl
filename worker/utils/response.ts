export function respuestaOk(
  data: Record<string, unknown> = {},
  status = 200
): Response {

  return Response.json(
    {
      ok: true,
      ...data
    },
    {
      status
    }
  );

}


export function respuestaError(
  mensaje: string,
  status = 400
): Response {

  return Response.json(
    {
      ok: false,
      mensaje
    },
    {
      status
    }
  );

}
