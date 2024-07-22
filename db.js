require("dotenv").config();

const postgres = require("postgres");
//Aquí estamos importando postgress LO QUE UTILIZAREMOS 

//ESTO ME CONECTA CON POSTGRES, Y LO CONECTA CON MIS DATOS, USAMOS VARIABLES DE ENTORNO PARA QUE SEA PRIVADO
function conectar(){
    return postgres({
        host : process.env.DB_HOST,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    });
}

//FUNCIONES PARA INTERACTUAR CON LA BASE DE DATOS

//1. Función para leer/extraer datos de la base de datos
function leerTareas(){
    //Esta promesa es la que se va a conectar con el mundo exterior. Y dentro pondremos un callback asíncrono
    return new Promise(async (ok,ko) => {
        //Esto es directo así que no hay que hacerlo asíncrono
        const conexion = conectar();
        //Intenta buscar las tareas, si las encuentra las mostrará
        try{
            let tareas = await conexion`SELECT * FROM tareas`;

            //ESTO CIERRA LA CONEXIÓN
            conexion.end();
            //ESTO DEVUELVE LA CONEXIÓN
            ok(tareas);
        }catch(error){
            //Si falla nos mostrará un error en la base de datos
            ko({ error: "error en la base de datos" });
        }

    });   
}

//2. Función para crear/actualizar datos de la base de datos
function nuevaTarea(tarea){
    //Esta promesa es la que se va a conectar con el mundo exterior. Y dentro pondremos un callback asíncrono
    return new Promise(async (ok,ko) => {
        //Esto es directo así que no hay que hacerlo asíncrono
        const conexion = conectar();
        //Intenta buscar las tareas, si las encuentra las mostrará
        try{
            //Le hacemos desestructuración porque solo nos interesa el id de esa lista que nos retornará la base de datos(Porque solo estamos )
            let [{id}] = await conexion`INSERT INTO tareas (tarea) VALUES (${tarea}) RETURNING id`;

            conexion.end();

            ok(id);
        }catch(error){
            //Si falla nos mostrará un error en la base de datos
            ko({ error: "error en la base de datos" });
        }

    });   
}


function borrarTarea(id){
   
    return new Promise(async (ok,ko) => {
 
        const conexion = conectar();
   
        try{
         
            let {count} = await conexion`DELETE FROM tareas WHERE id = ${id}`;

            conexion.end();

            ok(count);
        }catch(error){
          
            ko({ error: "error en la base de datos" });
        }

    });   
}
function actualizarEstado(id){
    return new Promise(async (ok,ko) => {
        const conexion = conectar();
        try{
            let {count} = await conexion`UPDATE tareas SET terminada = NOT terminada WHERE id = ${id}`;

            conexion.end();

            ok(count);

        }catch(error){
            ko({ error : "error en base de datos" });
        }
    });
}

function actualizarTexto(id,texto){
    return new Promise(async (ok,ko) => {
        const conexion = conectar();
        try{
            let {count} = await conexion`UPDATE tareas SET tarea = ${texto} WHERE id = ${id}`;

            conexion.end();

            ok(count);

        }catch(error){
            ko({ error : "error en base de datos" });
        }
    });
}
 


/* leerTareas()
.then(x => console.log(x))
.catch(x => console.log(x)) */

 //nuevaTarea("aprender React 1")
//.then(x => console.log(x))
//.catch(x => console.log(x))  


/* borrarTarea(0)
.then(x => console.log(x))
.catch(x => console.log(x)) */

//actualizarEstado(1)
//.then(x => console.log(x))

/* actualizarTexto(3, "un nuevo texto")
.then(x => console.log(x));
 */
module.exports = {leerTareas,nuevaTarea,borrarTarea,actualizarEstado,actualizarTexto};

