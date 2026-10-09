export function obtenerIdDesdeRuta(
  pathname: string
): number | null {


  const partes =
    pathname.split('/');


  const valor =
    partes[
    partes.length - 1
      ];


  const id =
    Number(
      valor
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return null;

  }


  return id;

}


export function esErrorUnique(
  error: unknown
): boolean {


  const mensaje =
    error instanceof Error
      ? error.message
      : String(error);


  return mensaje.includes(
    'UNIQUE constraint failed'
  );

}
