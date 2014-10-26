/*
 * Creado por: Julio Rodriguez
 * 
 * Validador javascript para formularios.
 * 
 * @param string boton : Id del boton de envio del form. predecedido del simbolo #
 * @param json options : JSON con los ids de los campos a validar y las opciones de cada uno
 * @param function funcionPrevia : Funcion a ejecutar antes de hacer la validación 
 * @version 1.3.1
 *  */

if(typeof(jd)=='undefined'){
    jd = function(){return true;};
}

/**
 * Json con validaciones disponibles, cada validación contiene la expresión regular para ejecutarse
 * y un mensaje generico.
 * 
 * El programador puede sobreescribir las mismas o agregar una nueva si los desea, accediendo al objeto desde donde lo instancia
 * sin necesidad de modificar el codigo original.
 */
jd.validaciones = {
      obligatorio:{mensaje:"El campo no puede estar vacio"},
      //email:{   expr:/^[_a-zA-Z0-9-]+(.[_a-z0-9-]+)*@[a-zA-Z0-9-]+(.[a-zA-Z0-9-]+)*(.[a-zA-Z]{2,3})$/, mensaje:"El campo debe ser un mail"},
      email:{   expr:/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/, mensaje:"El campo debe ser un mail"},
      numerico:{expr:/^\d+$/,mensaje:"El campo debe ser numerico"},
      decimal:{ expr:/^([0-9])*[.|,]?[0-9]*$/,mensaje :"El campo debe ser numerico con decimales"},
      caracteres:{expr: /^[A-ZñÑa-záéíóúÁÉÍÓÚ ]*$/,mensaje:'El campo solo puede contener caracteres'},
      celular:{expr:/^(412|416|414|424|426)\d{7}$/,mensaje:"El formato del celular no es valido"},
      telefono:{expr:/^2[0-9]{9,13}$/,mensaje:"El formato del telefono no es valido"},
      caracteresEspeciales:{expr:/^([^(*=;\\)])*$/,mensajes:"Caracteres invalidos en el campo"},      
      tiny:{mensaje:"El campo es obligatorio"},
      alfanumerico:{expr:/^[\dA-ZñÑa-záéíóúÁÉÍÓÚ., ]*$/,mensaje:"El campo solo puede contener letras y numeros"},
      documentacion:{expr:/^([V|E|G|J|P|N]{1}\d{8,10})*$/,mensaje:"El campo debe tener el siguiente formato J-18935170"},
      programa:{expr:/^[\d\/\.A-Za-z_-]*$/,mensaje:"El campo solo puede contener letras, guion y underscore"},
      minuscula:{expr:/[a-z]/,mensaje:"La contraseña debe tener al menos una minuscula"},
      mayuscula:{expr:/[A-Z]/,mensaje:"La contraseña debe tener al menos una mayuscula"},
      numero:{expr:/[0-9]/,mensaje:"La contraseña debe tener al menos un número"},
      caracteresEsp:{expr:/(\||\!|\"|\#|\$|\%|\&|\/|\(|\)|\=|\'|\?|\<|\>|\,|\;|\.|\:|\-|\_|\*|\~|\^|\{|\}|\+)/,mensaje:"La contraseña debe tener al menos un caracter especial"},
      coordenada:{expr:/^\-?[0-9]{2}\.[0-9]{3,15}/,mensaje:"La coordenada debe tener el siguiente formato:"},
      internacional:{expr:/^\d{9,18}$/,mensaje:"El telefono internacional no es valido"}
        
};

/**
 *  Reemplaza todas las ocurrencias de un valor en una cadena
 */
jd.replaceAll = function(value,charte,valorReplace){
    if(!valorReplace)
        valorReplace ="";
    var result = value;
    var posi = value.indexOf(charte);
    if(posi > -1) {
        while(posi > -1){
            result = value.substring(0,posi);
            result = result + valorReplace +value.substring(posi+1);
            posi = result.indexOf(charte);
            value = result;
        }
    }
        return(result);
};//final funcion
jd.validador = function(boton,options,funcionPrevia,callback,funcionError){
    
    /**
     * Botón sobre el cual se creará el validadorJida
     */
    
    this.idBoton ="#"+boton; 
    this.btn = $("#"+boton);
    /**
     * JSON con campos y validaciones del formulario
     * 
     * Json que contiene los id de los campos a validar y un array
     * con las validaciones sobre cada campo
     */
    this.options = options;
    this.funcionPrevia = (funcionPrevia)?funcionPrevia:"";
    this.callback = (callback)?callback:"";
    this.cssError = "div-error";
    this.funcionError = funcionError;
    /**
     * Div utilizado de referencia para mostrar el mensaje, por defecto el mensaje de error
     * será agregado antes (funcion jquery .before()) del div o campo indicado
     * Si se desea modificar el comportamiento por defecto y que el msj sea agregado dentro del div indicado
     * se debe modificar la propiedad vj.msjBefore a true
     */
    this.divMsjError;
    /**
     * Usado para función de msj por defecto, si es colocado en false el msj
     * sera mostrado como html del divMsjError 
     */
    this.msjBefore = true;
    /**
     * Alias para atributo "this" padre, iniciales del validadorJida
     * @var vj
     */
    vj = this;
    /**
     * Guarda la función asociada al evento onclick por medio del atributo
     * onclick
     */
    this.onclick="";
    
    this.validarFuncionOnclick();
    
    
    var _formulario = $( this.idBoton ).parents('form');
     
    $( document ).on('click',this.idBoton,this.iniciarValidador);  
    $( document ).on('submit',_formulario,this.iniciarValidador);  
    
     
};
jd.validador.prototype={
    /**
     * Función constructora que crea el validadorJida
     */
    iniciarValidador : function(event){
        //alias para boton del validador
        btn = this.btn;
        
        /**
         * Bandera que valida la ejecución correcta del validador
         * Si al finalizar su ejecución continua en 0 el formulario se encuentra
         * sin errores, por el contrario, si la bandera se encuentra en 1 el formulario
         * presenta algún error.
         */
        bandera =0;
        $("input, select, textarea").on('click',function(){
            
            $("."+vj.cssError).remove();
        });
        //validar función previa 
        if(vj.validarFuncionPrevia()){
            vj.eliminarMensajes(event);
            
            //agregar validaciones a los campos
            
            $.each(vj.options,function(campo,arrayValidaciones){
                //arreglo que registra el resultado de las validaciones
                
                //Se crea id en connotación para jquery
                if(bandera==0){
                    var idCampo = "#"+campo;
                    vj.divMsjError = idCampo;
                    if($( idCampo ).size()>0){
                        //Se creará la validación solo si el campo existe.
                        respuesta = vj.validarCampo(idCampo,arrayValidaciones);
                        if(respuesta.val==false){
                            bandera=1;
                            vj.mostrarMensajeError(idCampo,respuesta.mensaje,vj.divMsjError,vj.msjBefore);   
                        }    
                    }
                        
                }
                
            });//final foreach
            
            if(bandera==1){
                
                vj.addOnclick();
                
                return false;
            }else{
                
                vj.ejecutarOnclick(vj.onclick);
                if(vj.callback){
                    vj.callback(true,event);
                }else{
                    return true;    
                }
                
            }
        }else{
            $("body").data('validador-jida',false);
            //Entra ak si no se cumple la vista previa.
            return false;
        }
    },
    /**
     * Verifica si las validaciones requeridas existen en el array pasado a la función
     * 
     * En caso de que no existan une los arreglos y las agrega en false.
     */
    verificarValidaciones:function(validaciones){
        var validacionesDefault = {
            numerico:false,
            documentacion:false,
            obligatorio:false
        };
        return $.extend(validacionesDefault,validaciones);
        
    },
    validarCampo : function(idCampo,validaciones){
        
        arrayValidaciones = vj.verificarValidaciones(validaciones);
        /**
         * Bandera para verificar la ejecución del recorrido de las validaciones
         */
        var bandera = 0;
        var Mensaje  ="";
        var respuesta = new Array();
        respuesta.val=true;
        
        esObligatorio = arrayValidaciones.obligatorio;
        if(esObligatorio==true || typeof esObligatorio=='object'){
            
            result = vj.obligatorio(idCampo,arrayValidaciones.obligatorio);
            if(!result.val){
                
                result.mensaje=(esObligatorio.mensaje)?esObligatorio.mensaje:"El campo no puede estar vacio";
                
                return result;
            }
        }
        //----------------------------------------------------------
        $.each(arrayValidaciones,function(validacion,parametros){
            typeof(parametros);
            
            mensaje = (typeof(parametros.mensaje)!="undefined")?parametros.mensaje:"";
            //Solo se ejecuta si la validación está activada para el campo y si no hay
            if(parametros!==false && bandera==0 && validacion!='obligatorio'){
                //se valida si existe una función para la validación
                if (vj[validacion]){
                    if(!vj[validacion](idCampo,validacion,parametros)){
                       bandera =1;
                       respuesta.mensaje = (mensaje)?mensaje:jd.validaciones[validacion].mensaje;
                    }
                }else 
                //Sino existe, se valida si existe la expresión regular
                if ( jd.validaciones[validacion] ){
                  
                   if(!vj.ejecutarValidacion( idCampo,validacion )){
                       
                       bandera=1;
                       respuesta.mensaje= (mensaje)?mensaje:jd.validaciones[validacion].mensaje;
                   }//else 
                }else{
                    console.log("no existe la validación "+validacion);
                }//fin if          
                if(bandera==1){
                    
                    respuesta.validacion = validacion;
                   
                    respuesta.val=false;
                    bandera=2;
                }
            }    
        });//fin each
        return respuesta;
        //----------------------------------------------------------
    },
    /**
     * Ejecuta las validaciones estandar
     * 
     * Hace uso de la expresión regular correspondiente a la validacion
     * la expresión regular debe encontrarse en el objeto validaciones 
     *
     */
    ejecutarValidacion:function(campo,validacion){
        var expresion = jd.validaciones[validacion].expr;
        
        var valorCampo = $(campo).val();
        if(validacion=='numerico' || validacion=='decimal'){
            //Si el campo es numerico se eliminan los formatos de miles
            valorCampo=jd.replaceAll(valorCampo,'.');
            if(validacion=='decimal'){
            //Si el campo es decimal se cambia la coma de decimal por el punto
                valorCampo.replace(",",".");
            }
        }
        if(valorCampo!=""){
            
            if(expresion.test(valorCampo)){
                
               return true; 
            }else{
                return false;
            }    
        }else{
            
            return true;
        }//fin validacion vacioconsole.log(vj.onclick+" ak");
        
    },
    
    /**
     * Valida si se debe ejecutar una función antes del validador
     */
    validarFuncionPrevia : function(){
        if(this.funcionPrevia!=false && typeof(this.funcionPrevia) !='undefined'){
            result = vj.funcionPrevia.call();
            return result;
        }else{
            
            return true;
        }
    },
    validarFuncionOnclick: function(){
        var propOnclick = vj.btn.attr("onclick");
        
            if(propOnclick!=""){
                vj.onclick = propOnclick;
                vj.btn.attr("onclick","");
                
            }
    },
    /**
     * en caso de existir una función onclick que haya estado agregada al boton
     * la vuelve a agregar
     */
    addOnclick : function(){
         vj.btn.attr("onclick",this.onclick);
    },
    
    /**
     * Ejecuta la función onclick asociada al botón
     */
    ejecutarOnclick:function(fun){
        
       if(fun!="" && typeof(fun)!='undefined' && typeof(fun)!='null'){
        
        funcionOn = fun;
        
        funcion = funcionOn.substring(0,funcionOn.indexOf("("));
        parametros = funcionOn.substring(funcionOn.indexOf("(")+1,funcionOn.lastIndexOf(")"));
        
        b =funcionOn.substring(0,funcionOn.lastIndexOf(")"));
        b+=(parametros.length>0)?",3)":")"; 
        eval(b);
       } 
    },
    /**
     * Arreglo de validaciones con las expresiones regulares correspondientes
     */

    /**resp
     * Elimina los mensajes de error del formulario
     */
    eliminarMensajes:function(){
        $("."+this.cssError).remove();
        
    },
    
    /**
     * Validar si el control ha sido llenado
     * 
     * Verifica que se haya ingresado algún dato en el control
     * @return array resp arreglo{
     *      @var boolean resp.val false=>Error true=>bien
     *      @var string message => Mensaje de error
     * }
     */
    obligatorio:function(campo,arr){//VALIDAR SI UN CAMPO ESTA VACIO;
        
        var tipoCampo = $(campo).attr('type');
        var resp = new Array();
        var condicion=true;
        if(arr.condicional){
            
                var valor;
                if(arr.tipo && arr.tipo=="radio"){
                        nombreCampo = $("#"+arr.condicional).attr('name');
                      valor = $("input[name="+nombreCampo+"]:checked").val();
                    }else{
                      valor = $("#"+arr.condicional).val();
                    }
                if(valor==arr.condicion){
                    condicion=true;
                }else{
                   condicion=false;
                }
        }else{
                condicion=true;
        }
        
        if(condicion===true){
                switch (tipoCampo){
                    case 'RADIO':
                    case 'radio':
                        nombreCampo = $(campo).attr('name');
                        resp.radio=true;
                        if($("input[name="+nombreCampo+"]:checked").length>0){
                            resp.val=true;
                        }else{
                            resp.val=false;
                        }
                        break;
                    default:
                    
                        if($(campo).val()==""){
                            resp.val=false;
                        }else{
                            resp.val=true;
                        }
                    
                    break;  
                    }//final switch========================
        }else{
                resp.val=true;
        }
        return resp;
    },//fin valVacio,
    documentacion:function(campo,validacion,parametros){
      
        var expresion = jd.validaciones[validacion].expr;
        var valorCampo = $(campo).val();
        
        if(parametros.campo_codigo){
            
            valorCampo = $(campo+"-tipo-doc").val()+valorCampo;
            
        }
        
        if(valorCampo!=""){
            if(expresion.test(valorCampo)){
                
               return true; 
            }else{
                return false;
            }    
        }else{
            
            return true;
        }//fin validacion
        
    },
    telefono:function(id,validacion,parametros){
        var totalDigitos =10;
        var codigo="";
        var extension="";
        var expresionTlf=jd.validaciones['telefono'].expr;
        var expresionCel=jd.validaciones['celular'].expr;
        var expresionInter=jd.validaciones['internacional'].expr;
        
        var valorCampo = $( id ).val();
        
        if(parametros.code){
            codigo = $(id+"-codigo").val();
            vj.divMsjError  = "#box"+jd.replaceAll(id,"#","");
        } 
        if(parametros.ext){
            totalDigitos+=4;
            extension=$(id+"-ext").val();
        }

        valorCampo = codigo+valorCampo+extension;
        if(valorCampo!=""){
            
        
            var celularValido = (expresionCel.test(valorCampo))?1:0;
            var TelefonoValido = (expresionTlf.test(valorCampo))?1:0;
            var internacionalValido =(expresionInter.test(valorCampo))?1:0;
            if( parametros.tipo && (parametros.tipo=='telefono' && TelefonoValido==1 ||    
                parametros.tipo=='celular' && celularValido==1 ||
                parametros.tipo=='internacional' && internacionalValido==1 || 
                parametros.tipo=="multiple" && (TelefonoValido==1 || celularValido==1))||
                !parametros.tipo && TelefonoValido==1){
                    
                     return true;
                 }else{
                     return false;
                 }
        }else{
            return true;
        }
    },
    
    igualdad:function(id,validacion,parametros){
        campo = $("#"+parametros.campo);
        if($(id).val()==campo.val())
            return true;
        else
            return false;
    },
    /*------------------------------------------------------**/
    contrasenia:function(id,validacion,parametros){
        
        var expresionMin = jd.validaciones['minuscula'].expr;
        var expresionMay = jd.validaciones['mayuscula'].expr;
        var expresionNum = jd.validaciones['numero'].expr;
        var expresionCaractEsp = jd.validaciones['caracteresEsp'].expr;        
        var valorCampo =  $( id ).val();

        if(valorCampo!=""){
        
            var minuscula = (expresionMin.test(valorCampo))?1:0;
            var mayuscula = (expresionMay.test(valorCampo))?1:0;
            var numero = (expresionNum.test(valorCampo))?1:0;
            var caracterEsp = (expresionCaractEsp.test(valorCampo))?1:0;
            
            if( minuscula==1 && mayuscula==1 && numero==1 && caracterEsp==1 && valorCampo.length >= 8){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    },/*-----------------------------*/
    tiny:function(campo,validacion,parametros){
        
        nombreCampo = $(campo).attr('name');
        var resp;
        var valorCampo = tinyMCE.get(nombreCampo);
        valorCampo.setProgressState(1); // Show progress
        window.setTimeout(function() {

                valorCampo.setProgressState(0); // Hide progress      
        }, 300);
        //console.log(parametros.toSource());
        if(valorCampo.getContent()=="" && parametros['obligatorio']==true){
            return false;   
        }else{
            contenido = valorCampo.getContent();
            $(campo).val(contenido); 
            return true;
        }
        return false;
    
            
    },//final funcion tiny
    mostrarMensajeError:function(campo,mensaje,divError,before){
        before = (before)?true:false;
        
        if(vj.funcionError){
            vj.funcionError.call(this,campo,mensaje);
        }else{
            $(window).scrollTop($(campo).offset().top - 150);
            $(campo).focus();
            
            if(divError){
                $(divError).before("<div class=\""+this.cssError+"\">"+mensaje+"</div>");    
            }else{
                $(divError).html("<div class=\""+this.cssError+"\">"+mensaje+"</div>");
            }
                
        }
        
        
    },  
};//final prototype del validadorJida
//Jd = new jd;

   