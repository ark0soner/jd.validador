ValidadorJida
=============
Validador para Formularios con Javascript 
____

** validadorJida.js** es un objeto javascript que permite realizar validaciones completas
de formularios estaticos a partir de una configuración por medio de JSON.

El validador, al igual que el **JidaControl.js** tiene una serie de validaciones por defecto
las cuales son : 

* **obligatorio** : Valida campos obligatorios
* **email** : Valida campos para correos de teléfono
* **numerico** : Valida campos solo númericos sin decimale
* **decimal** : Valida campos númericos con decimales
* **caracteres** : Valida campos que solo contengan caracteres
* **celular** : Valida tormato para celulares (Venezuela)
* **telefono** : Valida formato para telefonos (Venezuela)
* **caracteresEspeciales** : Valida caracteres especiales *usado para validaciones compuestas*
* **documentacion** : Valida documentos de identificación, como RIF o Cedula (Venezuela)
* **programa**: solo permite caracteres que permitan formar nombres de variables 
* **minuscula** : Do you need understand it?*usado para validaciones compuestas*
* **mayuscula** :  Do you need understand it? *usado para validaciones compuestas*
* **numero** : Campo númerico, *usado para validaciones compuestas*
* **caracteresEsp** : *usado para validaciones compuestas*
* **internacional**: Telefonos internacionales *usado para validaciones compuestas*


##Facil uso  
```
 new validadorJida('idBotonEnvio',{
 						'idCampo1' : {"validacion" : {"configuracion":"valorConfiguracion"}}
 					});
```


## Breve Documentación 

### Parametros 

El validadorJida recibe de caracter obligatorio 2 parametros, el id del boton del formulario
sobre el cual se debe hacer click para comenzar la validación y el JSON con las validaciones a 
realizar. 
En general, los parametros posibles son :

* ** boton ** : Id del botón del formulario
* **options** : JSON con opciones de validacion
* **funcionPrevia** : [opcional] Nombre de función o funcion lambda a ejecutar antes de que se ejecute el validador
* **callback** : [opcional] Función a ejecutar posterior a que se ejecute el validador
* **funcionError : [opcional] Permite personalizar una función para mostrar los errores.

## JSON Options

Solo serán validados los campos cuyos ids sean pasados en el json de opciones. ASimismo, cada campo
pasado es una clave que recibe un json con las validaciones para el campo.

```
new validadorJida("idBoton",{ 
	'nombre':{'obligatorio','caracteres'},
	'apellido':{'caracteres':{"mensaje":"El apellido solo puede llevar caracteres"}},
	'correo' }
	);
```

De igual Forma, cada validacion agregada para un campo puede ser una clave que reciba un JSON para parametros
de la validacion. Por defecto, todas las validaciones permiten personalizar el mensaje de error.
EJM: 
```
new validadorJida("idBoton",{ 
		'nombre':{'obligatorio' : {'mensaje': 'Debe ingresar el nombre'},
		'telefono':{'ext':true,'mensaje':'El formato del telefono no es valido'}}
);
 
```
En el caso anterior, el campo telefono intentará validar un campo adicional para una *extensión* del número teléfonico.

Si no es pasado un valor mensaje para el campo. el validadorJida mostrará el mensaje
por defecto configurado para la validación en el 

##Comportamiento por defecto

El validador devuelve error por cada error conseguido. la función manejadora de los errores por defecto
crea un div justo despues del control con error para mostrar un mensaje de error. El div tiene agregada
una clase div-error. Si deseas usar esa misma función utilizando, basta con que definas un css para esa clase.


Si deseas pasar alguno de los parametros opcionales. debes pasarlos en el orden indicado. Si deseas solo
*personalizar la función de error y no funciones previas o callback* debes pasar null a esos parametros.



