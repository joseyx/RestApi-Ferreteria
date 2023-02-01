
# Rest Api Ferreteria

Rest api para e-commerce app


## Ejecutar de forma local

Clonan el proyecto

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
formato: "postgresql://[user[:password]@][netloc][:port][/dbname]"

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


