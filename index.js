
require("dotenv").config();
//Este modulo leerá si hay un dotenv y va a guardar esas variables

const express = require("express");
const cors = require("cors");
const {leerTareas,nuevaTarea,borrarTarea,actualizarEstado,actualizarTexto} = require("./db");

const servidor = express();

servidor.use(cors()); //Esto es para poner en marcha cors y se pone en este lugar. Esto me permite hace peticiones desde cualquier dominio (en este caso) también podremos especificar desde donde 

//Intercepta cualquier info en json y convertirla a objeto y la almacenará en petición.body
//ESO ES UN MIDDLEWARE intercepta el json y lo guarda en el body de la petición
servidor.use(express.json());
//solo se fiará del content-type de la aplication/json

if(process.env.PRUEBAS){
    servidor.use("/pruebas", express.static("./pruebas")); //Lo primero es como se llamará la url donde estará ubicado el resultado. Lo segundo es la carpeta donde se ubicaran las cosas
}

servidor.get("/tareas", async (peticion,respuesta) => {
    try{
        let tareas = await leerTareas();
        respuesta.json(tareas);
    }catch(error){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor"});
    }
});

servidor.post("/tareas/nueva", async (peticion,respuesta,siguiente) => {//como se va a comunicar con el middelware del error vamos a necesitar también (siguiente)
    /*  console.log(peticion.body);
    respuesta.send("...crear una tarea") */
    let {tarea} = peticion.body; //La extraemos de aquí porque es donde guarda la tarea body.parser

    //si yo desestructuro y añado un valor nuevo ese valor será undefined (que es false)
    //para evitar esto hacemos esto porque .trim no funciona con cosas undefined.
    if(tarea && tarea.trim() != ""){//primero pregunta si la tarea existe
        //si tarea y tarea sin espacios es igual a vacío
        // return respuesta.send("todo OK");
        try{
            let id = await nuevaTarea(tarea);
            //si funciona la gardamos en la base de datos
            respuesta.status(201);
            return respuesta.json({id});//Con esto estamos enviando el status 200 y en el caso de crear algo nuevo es mejor usar un 201
            //la mostramos con el id
        }catch(error){
            respuesta.status(500);
            return respuesta.json({ error : "error en el servidor" }) //Este return sirve para que la función termine en el caso de que no funcione ninguno invocaremos la función siguiente de abajo que nos llama a un error
        }
    }

    siguiente({ error : "no tiene la propiedad TAREA" }); //si tenemos varios middlewares lo pasa al siguiente para que siga continuando

});

servidor.put("/tareas/actualizar/:operacion(1|2)/:id([0-9]+)", async (peticion,respuesta,siguiente) => {
    let operaciones = [actualizarTexto,actualizarEstado];//Dos funciones una para el texto otra para el estado y las guardamos en la variable "operaciones"

    let {id, operacion} = peticion.params;//De los parámetros de la url de la petición estamos solicitando el id y la operación

    operacion = Number(operacion); //Convertimos la operación a un número. Y solo puede ser 1 o 2. Esto lo hace compatible con otros lenguajes solo number
    
    let {tarea} = peticion.body; //Extraemos la tarea del body de la petición

    if (operacion == 1 && (!tarea || tarea.trim() == "")){//Si operación es 1 y no hay tarea o tarea es un string vacío nos devolverá el texto de abajo
        return siguiente({ error : "no tiene la propiedad TAREA" }); //Esto me dice que si lo datos son correcto o no 
    }
    try{
        let cantidad = await operaciones[operacion - 1](id, operacion == 1 ? tarea : null);//ESTA ES UNA LÍNEA EXCESIVAMENTE PROGRAMÁTICA POR ELLO ES IMPORTANTE ENTENDERLA BIEN. Aquí estamos esperando a que de la red de operaciones la operación 1 es (operaciones [0] de ahí el [operacion -1]) es decir la operación (actualizar) 
        //Esto se convertirá en función de la operacion en actualizarTexto o actualizarEstado. Y después le pasamos el id de la operaciones, y le decimos que si la operación es igual a 1 pasamos la tarea y si no null
        respuesta.json({ resultado : cantidad ? "ok" : "ko"});
    }catch(error){
        respuesta.status(500);
        respuesta.json({ error : "error en el servidor" })
    }
});

servidor.delete("/tareas/borrar/:id([0-9]+)", async (peticion,respuesta) => {//id es el nombre del parámetro los (:) lo identificará como dinámico
                                                                            //Le hemos dicho que puede ser uno o más (+) dígitos del 0 al 9
        try{
            let cantidad= await borrarTarea(peticion.params.id);
            respuesta.json({ resultado : cantidad ? "ok" : "ko"});
        }catch(error){
            respuesta.status(500);
            respuesta.json({ error : "error en el servidor"});
        }
    }
    //respuesta.send(`borraremos id --> ${peticion.params.id}`);
);

servidor.use((error,peticion,respuesta,siguiente) => {//Caeremos en el erro si cualquier middleware anterior hace un throw o cae ahí
    respuesta.status(400);
    respuesta.json({ error : "error en la petición" });
})

servidor.use((peticion,respuesta) => {//Esto nos tira el error 404 
    respuesta.status(404);//Esto se lo explica a la máquina con un status 404
    respuesta.json({ error : "error recurso no encontrado" });//Esto se lo explica al usuario
})


servidor.listen(process.env.PORT);
