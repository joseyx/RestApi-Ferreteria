
# Rest Api Ferreteria

Rest api para e-commerce app


## Ejecutar de forma local

Clone the project

```bash
  git clone https://github.com/joseyx/RestApi-Ferreteria.git
```

Entran al directorio del proyecto

```bash
  cd RestApi-Ferreteria
```

Instalan las dependencias

```bash
  npm install
```
Luego crean las *environment variables*
## Environment Variables

Para ejecutar el proyecto deben hacer un archivo .env en la carpeta raiz del proyecto y añadir las siguientes variables:


`DATABASE_URL` (direccion a la base de datos)
formato: postgresql://[user[:password]@][netloc][:port][/dbname]

`JWT_SECRET` (puede ser un string cualquiera)

`PORT` (un puerto cualquiera de la computadora siempre y cuando este disponible)


## Ejecucion

Para ejecutar el proyecto deben hacer los siguiente comandos

```bash
npm run updateDB (solo se usa la primera vez que se ejecute el programa)
npm run dev
```


## Contribuciones o cambios al codigo

Son libres de probar el codigo!

Si quieren hacer modificaciones por favor sigan los siguientes pasos:

Definir el nombre de la rama y/o funcion que quieren crear, preferiblemente que sea corto pero descriptivo y hacer el siguiente comando:

```bash
git checkout -b [nombre de la rama]
```

Pueden verificar que la rama se haya creado con el siguiente comando:

```bash
git branch
```
Deberian poder ver la rama master y la que acaban de crear con un * indicando que ya se encuentran en esa rama.
Una vez hecho eso ya pueden modificar el codigo.



## API Reference

### Autentificacion

#### Sign Up / Registro

```http
  POST /auth/register
```

| Parametro | Tipo     | Descripcion                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Requerido**. Correo vinculado a la persona |
| `password` | `string` | **Requerido**. Contraseña utilizada para iniciar sesion |
| `firstName` | `string` | **Requerido**. Primer Nombre de el usuario |
| `lastName` | `string` | **Requerido**. Apellido de el usuario |
| `state` | `string` | **Requerido**. Estado en el cual se ubica el usuario |
| `city` | `string` | **Requerido**. Ciudad en la cual se ubica el usuario |
| `address` | `string` | **Requerido**. Direccion del usuario |
| `phoneNumber` | `string` | **Requerido**. Numero de telefono del usuario** |

**El numero de telefono debe estar en el siguiente formato:  
`[+][codigo del pais][prefijo telefonico][numero telefonico]`  
Sin dejar espacios o agregar simbolos mas alla del '+' al inicio

#### Log In / Inicio de session

```http
  POST /auth/login/
```

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `email` | `string` | **Requerido**. Correo vinculado a la persona |
| `password` | `string` | **Requerido**. Contraseña utilizada para iniciar sesion |

Esta solicitud devuelve un JSON web token (JWT) con el cual la api verificara que tengamos una sesion iniciada

### Productos

#### Get all products / Obtener todos los productos

```http
  GET /products/
```
Devuelve un json con todos los productos

#### Crear producto

```http
  POST /products/create_product/
```

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `productName` | `string` | **Requerido**. Nombre del producto |
| `description` | `string` | **Requerido**. Descripcion del producto |
| `categories`* | `Array[string]` | **Requerido**. Arreglo de con las categorias a las que pertenece el producto |
| `Keywords` | `Array[string]` | **Requerido**. Arreglo de palabras clave para el producto |
| `thumbnail` | `File` | **Requerido**. Imagen con la portada del producto |
| `photos` | `Files` | **Requerido**. De 1 a 10 imagenes con la portada del producto |
| `sku`** | `Objeto json` | **Requerido**. objeto json con la informacion numerica del producto |

**El objeto sku: debe incluir los siguientes parametros:

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `sku` | `string` | **Requerido**. Codigo unico del producto |
| `price` | `number` | **Requerido**. Precio en dolares del producto, no debe tener simbolos |
| `stock` | `number`(entero) | **Requerido**. Cantidad de unidades disponibles |
| `minStock` | `number`(entero) | **Requerido**. Cantidad minima de unidades disponibles deseada |
| `unit` | `string` | **Opcional**. Unidad correspondiente al producto, por defecto es 'Unidades' |
| `expDate` | `Date` | **Opcional**. fecha de vencimiento del producto |

#### Obtener product

```http
  GET /products/product/[ID]
```

Devuelve un objeto JSON con toda le informacion del producto correspondiente al id ingresado


#### Obtener productos proximos a vencer

```http
  GET /products/exp
```

Devuelve un array de objetos JSON con los productos proximos a vencer

#### Eliminar producto

```http
  DELETE /products/product/[ID]
```

Elimina el producto correspondiente al id ingresado

#### Actualizar producto

```http
  POST /auth/login/
```

Se puede modificar cualquier dato a excepcion de las imagenes, para modificar los datos se debe enviar un objeto JSON similar al usado para crear el producto pero unicamente con los datos modificados

#### Productos por categoria

```http
  GET /products/[categoria]
```

Devuelve un array de objetos JSON con la informacion de los productos pertenecientes a dicha categoria

#### Busqueda personalizada

```http
  GET /products/search/[termino de busqueda]
```

Devuelve un array de productos que contengan el termino de busqueda en el nombre, la categoria o la palabra clave


###  Categorias

#### Mostrar categorias

```http
  GET /category/
```

Devuelve un objeto JSON con todas las categorias

#### Crear categoria

```http
  POST /category/create
```

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `categoryName` | `string` | **Requerido**. Nombre de la categoria |

#### Crear categoria hija

```http
  POST /category/create_child
```

Crea una subcategoria dentro de la categoria seleccionada

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `categoryName` | `string` | **Requerido**. Nombre de la subcategoria |
| `parentCategory` | `string` | **Requerido**. Nombre de la categoria padre |


#### Eliminar categoria

```http
  DELETE /category/delete
```

Elimina la categoria indicada en la solicitud y sus sub categorias en caso de tenerlas

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `categoryName` | `string` | **Requerido**. Nombre de la cateogria a eliminar |

###  Carrito (todas las solicitudes requieren una sesion iniciada)

#### Obtener carrito


```http
  GET /cart/
```

Devuelve un JSON con la informacion correspondiente al carrito del usuario con sesion iniciada

#### Agregar producto al carrito

```http
  POST /cart/add_product
```

Agrega un producto al carrito con la cantidad indicada

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `productId` | `number` | **Requerido**. ID del producto que se desea agregar |
| `quantity` | `number` | **Requerido**. Cantidad del producto que se desea agregar |


#### Actualizar la cantidad del producto en el carrito

```http
  POST /cart/update_cart
```

Cambia la cantidad del producto agregado

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `productId` | `number` | **Requerido**. ID del producto a modificar |
| `quantity` | `number` | **Requerido**. Nueva cantidad del producto agregado al carrito |

#### Eliminar producto del carrito o disminuir cantidad

```http
  POST /cart/add_product
```

Elimina un producto del carrito o modifica la cantidad

| Parametro | Tipo     | Descripcion                      |
| :-------- | :------- | :-------------------------------- |
| `productId` | `number` | **Requerido**. ID del producto que se desea modificar/eliminar|
| `quantity` | `number` | **Requerido**. Cantidad del producto que se desea eliminar |

###  Orden (todas las solicitudes requieren una sesion iniciada)

#### Obtener carrito


```http
  GET /order/
```

Crea una orden con los productos presentes en el carrito, posteriormente limpia todos los productos del carrito y devuelve un ID / codigo unico para procesar la orden mediante el chatbot de whatsapp
