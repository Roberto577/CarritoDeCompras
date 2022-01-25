const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

//Muestra el api al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    //Si existe un carrito
    if(localStorage.getItem('carrito')){
        //Reemplazamos el texto plano por una coleccion de objetos
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
})

//e es para capturar el elemento a modificar
cards.addEventListener('click', e => {
    addCarrito(e);
})

items.addEventListener('click', e => {
    btnAccion(e);
})

//Cargamos el api.json
const fetchData = async () => {
    try{
        const res = await fetch('api.json');
        const data = await res.json();
        pintarCards(data);
    } catch(error){
        console.log(error);
    }
}

//Recibimos la data como parametro
const pintarCards = data => {
    //Recorremos la data
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.title;
        templateCard.querySelector('p').textContent = producto.precio;
        //setAttribute remplaza el nombre por el porducto recorrido
        templateCard.querySelector('img').setAttribute('src', producto.thumbnailUrl);
        //Agrega el id al button para saber que producto es
        templateCard.querySelector('button').dataset.id = producto.id

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    })
    cards.appendChild(fragment);
}

const addCarrito = e => {
    if(e.target.classList.contains('btn-dark')) {
        //ParentElement me trae todos los elementos
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation();
}

//Al darle click al boton comprar nos selecionara todos los elementos para que sean agregados a este setCarrito
const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('button').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    //Si la propiedad id se repite aumentamos la cantidad
    if(carrito.hasOwnProperty(producto.id)){
        //Infresamos al carrito id, aumentamos la cantidad cuando se repita
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    //... hacemos una copia de producto
    carrito[producto.id] = {...producto}
    pintarCarrito();
}

const pintarCarrito = () => {
    //Items parte vacio
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
    
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);

    pintarFooter();


    //Cada vez que se pinte nuestro carrito lo guardamos en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

const pintarFooter = () => {
    footer.innerHTML = '';
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
        return
    }

    //Suma el nantiguo con el nuevo
    const nCantidad = Object.values(carrito).reduce((acumulador,{cantidad}) => acumulador + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acumulador, {cantidad, precio}) => acumulador + cantidad * precio, 0);

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    })
}

const btnAccion = e => {
    if(e.target.classList.contains('btn-info')){
        carrito[e.target.dataset.id];

        const producto = carrito[e.target.dataset.id];
        producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
        carrito[e.target.dataset.id] = {...producto};

        pintarCarrito();
    }
    if(e.target.classList.contains('btn-danger')){
        carrito[e.target.dataset.id];

        const producto = carrito[e.target.dataset.id];
        producto.cantidad = carrito[e.target.dataset.id].cantidad - 1;
        carrito[e.target.dataset.id] = {...producto};
        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id];
        }
        pintarCarrito();
    }

    e.stopPropagation();
}