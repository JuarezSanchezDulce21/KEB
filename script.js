// KEB - funciones de tienda y carrito.
// El precio es provisional; cambia este valor cuando se defina el precio comercial.
const PRODUCTO_KEB = { id: "keb-kit", nombre: "Kit Ecológico Biodegradable", precio: 99.00 };
const CLAVE_CARRITO = "keb-carrito";

function obtenerCarrito() {
  try { return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || []; }
  catch (error) { return []; }
}
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarContadores();
}
function actualizarContadores() {
  const cantidad = obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
  document.querySelectorAll(".contador-carrito").forEach(el => el.textContent = cantidad);
}
function agregarAlCarrito(id) {
  if (id !== PRODUCTO_KEB.id) return;
  const carrito = obtenerCarrito();
  const existente = carrito.find(item => item.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ id, nombre: PRODUCTO_KEB.nombre, precio: PRODUCTO_KEB.precio, cantidad: 1 });
  guardarCarrito(carrito);
  const mensaje = document.getElementById("mensaje-tienda");
  if (mensaje) mensaje.textContent = "¡Listo! El kit se agregó a tu carrito.";
}
function cambiarCantidad(id, cambio) {
  const carrito = obtenerCarrito();
  const item = carrito.find(producto => producto.id === id);
  if (!item) return;
  item.cantidad += cambio;
  guardarCarrito(carrito.filter(producto => producto.cantidad > 0));
  mostrarCarrito();
}
function eliminarProducto(id) {
  guardarCarrito(obtenerCarrito().filter(item => item.id !== id));
  mostrarCarrito();
}
function formatoMoneda(cantidad) {
  return cantidad.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
function mostrarCarrito() {
  const contenedor = document.getElementById("contenido-carrito");
  if (!contenedor) return;
  const carrito = obtenerCarrito();
  if (!carrito.length) {
    contenedor.innerHTML = '<div class="carrito-vacio"><div>🛒</div><h2>Tu carrito está vacío</h2><p>Agrega un kit KEB para comenzar.</p><a class="boton" href="tienda.html">Ir a la tienda</a></div>';
    return;
  }
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  contenedor.innerHTML = `
    <section class="lista-carrito">${carrito.map(item => `
      <article class="item-carrito"><div class="item-imagen">🪴</div><div class="item-datos"><h3>${item.nombre}</h3><p>${formatoMoneda(item.precio)} por unidad</p><button class="texto-boton" onclick="eliminarProducto('${item.id}')">Eliminar</button></div>
      <div class="controles-cantidad"><button aria-label="Disminuir cantidad" onclick="cambiarCantidad('${item.id}',-1)">−</button><strong>${item.cantidad}</strong><button aria-label="Aumentar cantidad" onclick="cambiarCantidad('${item.id}',1)">+</button></div><strong>${formatoMoneda(item.precio * item.cantidad)}</strong></article>`).join("")}
    </section>
    <aside class="resumen-carrito"><h2>Resumen</h2><div class="linea-resumen"><span>Subtotal</span><strong>${formatoMoneda(total)}</strong></div><div class="linea-resumen"><span>Envío</span><span>Por confirmar</span></div><div class="linea-resumen total"><span>Total de productos</span><strong>${formatoMoneda(total)}</strong></div><p class="nota">El costo y la disponibilidad de entrega se confirmarán antes de completar el pedido.</p><a class="boton boton-ancho" href="pago.html">Continuar con la compra</a><a class="enlace enlace-centro" href="tienda.html">Seguir comprando</a></aside>`;
}
function prepararPago() {
  const resumen = document.getElementById("resumen-pago");
  const form = document.getElementById("formulario-pedido");
  if (!resumen || !form) return;
  const carrito = obtenerCarrito();
  const layout = document.getElementById("checkout-layout");
  const sinProductos = document.getElementById("sin-productos");
  if (!carrito.length) {
    layout.classList.add("oculto");
    sinProductos.classList.remove("oculto");
    return;
  }
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  resumen.innerHTML = carrito.map(item => `<div class="linea-resumen"><span>${item.nombre} × ${item.cantidad}</span><strong>${formatoMoneda(item.precio * item.cantidad)}</strong></div>`).join("") + `<div class="linea-resumen total"><span>Total</span><strong>${formatoMoneda(total)}</strong></div>`;
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const datos = Object.fromEntries(new FormData(form).entries());
    const confirmacion = document.getElementById("confirmacion-demo");
    layout.classList.add("oculto");
    confirmacion.classList.remove("oculto");
    confirmacion.innerHTML = `<div class="confirmacion-icono">✓</div><span class="etiqueta">PROTOTIPO DE COMPRA</span><h2>¡Gracias, ${escaparHTML(datos.nombre)}!</h2><p>El formulario se validó correctamente y tu pedido está preparado como demostración.</p><p><strong>Total:</strong> ${formatoMoneda(total)}</p><p class="nota">Todavía no se realizó ningún cobro ni se envió un pedido real. Para aceptar pagos será necesario conectar una pasarela segura, como Mercado Pago, y configurar su integración.</p><a class="boton" href="index.html">Volver al inicio</a>`;
  });
}
function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, caracter => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[caracter]));
}
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadores();
  mostrarCarrito();
  prepararPago();
});
