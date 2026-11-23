const URL_API = "https://rickandmortyapi.com/api/location";
const CLAVE_STORAGE = "ultimaBusqueda";

const formulario = document.querySelector("#formulario-busqueda");
const campoNombre = document.querySelector("#campo-nombre");
const campoTipo = document.querySelector("#campo-tipo");
const botonBuscar = document.querySelector("#boton-buscar");
const mensaje = document.querySelector("#mensaje");
const contenedorResultados = document.querySelector("#resultados");

// ---------- Utilidades ----------
const valorOCero = (valor) =>
  valor === undefined || valor === null || valor === "" || String(valor).toLowerCase() === "unknown"
    ? "Desconocido"
    : String(valor);

const mostrarMensaje = (texto, esError = false) => {
  mensaje.textContent = texto;
  mensaje.classList.toggle("mensaje--error", esError);
};

const limpiarResultados = () => {
  contenedorResultados.replaceChildren();
};

const alternarCarga = (cargando) => {
  botonBuscar.disabled = cargando;
  if (cargando) mostrarMensaje("Buscando…");
};

// ---------- Persistencia ----------
const guardarBusqueda = (nombre, tipo) => {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ nombre, tipo }));
  } catch (error) {
    console.warn("No se pudo guardar la búsqueda:", error);
  }
};

const leerBusquedaGuardada = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_STORAGE));
  } catch (error) {
    return null;
  }
};

// ---------- API ----------
const pedirUbicaciones = async (nombre, tipo) => {
  const url = new URL(URL_API);
  if (nombre) url.searchParams.set("name", nombre);
  if (tipo) url.searchParams.set("type", tipo);

  const respuesta = await fetch(url);
  if (respuesta.status === 404) return [];
  if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);

  const datos = await respuesta.json();
  return datos.results;
};

// ---------- Tarjetas ----------
const crearDato = (etiqueta, valor) => {
  const parrafo = document.createElement("p");
  parrafo.className = "tarjeta__dato";

  const etiquetaEl = document.createElement("span");
  etiquetaEl.className = "tarjeta__etiqueta";
  etiquetaEl.textContent = `${etiqueta}: `;

  const valorEl = document.createElement("span");
  valorEl.textContent = valor;

  parrafo.append(etiquetaEl, valorEl);
  return parrafo;
};

const crearTarjeta = (ubicacion) => {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";

  const titulo = document.createElement("h2");
  titulo.className = "tarjeta__nombre";
  titulo.textContent = valorOCero(ubicacion.name);

  tarjeta.append(
    titulo,
    crearDato("Tipo", valorOCero(ubicacion.type)),
    crearDato("Dimensión", valorOCero(ubicacion.dimension)),
    crearDato("Residentes", String(ubicacion.residents.length))
  );
  return tarjeta;
};

const mostrarTarjetas = (ubicaciones) => {
  limpiarResultados();
  contenedorResultados.append(...ubicaciones.map(crearTarjeta));
};

// ---------- Búsqueda ----------
const buscar = async (nombre, tipo) => {
  if (!nombre && !tipo) {
    limpiarResultados();
    mostrarMensaje("Escribe un nombre o un tipo para buscar.", true);
    return;
  }

  alternarCarga(true);
  try {
    const ubicaciones = await pedirUbicaciones(nombre, tipo);
    if (ubicaciones.length === 0) {
      limpiarResultados();
      mostrarMensaje("Sin resultados para tu búsqueda.");
    } else {
      mostrarTarjetas(ubicaciones);
      mostrarMensaje(`Se encontraron ${ubicaciones.length} ubicaciones.`);
    }
    guardarBusqueda(nombre, tipo);
  } catch (error) {
    console.error(error);
    limpiarResultados();
    mostrarMensaje("Ocurrió un error al buscar. Revisa tu conexión e inténtalo de nuevo.", true);
  } finally {
    botonBuscar.disabled = false;
  }
};

const manejarEnvio = (evento) => {
  evento.preventDefault();
  buscar(campoNombre.value.trim(), campoTipo.value.trim());
};

const restaurarBusqueda = () => {
  const guardada = leerBusquedaGuardada();
  if (!guardada) return;
  campoNombre.value = guardada.nombre || "";
  campoTipo.value = guardada.tipo || "";
  if (guardada.nombre || guardada.tipo) buscar(guardada.nombre, guardada.tipo);
};

formulario.addEventListener("submit", manejarEnvio);
restaurarBusqueda();
