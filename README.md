<!-- @format -->

Integracion entre dos dominios de diferente plataforma, en este caso VUE y
REACT, desde una plataforma puedes mandar variables al localStorage en el otro
dominio.

una vez instalado el plugin se debera instalar el paquete 'dotenv' para las URL
permitidas

Crear en el archivo .env la constante REACT_APP_WHITELISTREACT y dentro colocar
las URL o Lista blanca

Ejemplo demostrativo de como pasar una variable del localStorage de VUE a REACT

//Para efectos de demostracion se carga toda la informacion en el mounted para
que realice el envio directo al otro dominio

crear un archivo index.vue

<template>
  <div>
    <h1>ENVIANDO VARIABLES A RECT</h1>
  </div>
</template>
<script>
import Vue from "vue";
import integrationDomain from "integration-cross-storage-domain";

Vue.use(integrationDomain);

export default {

mounted() {

var cdstorage = integrationDomain.crossDomainStorage({ origin:
"http://localhost:8000", path: "/" });

    cdstorage.setItem(
      "variable_3000",
      "Esto es una variable creada desde VUE a REACT..."
    );

    cdstorage.setItem(
      "variable2_3000",
      "Esto es una variable creada desde VUE a REACT...2"
    );

    cdstorage.setItem(
      "variable3_3000",
      "Esto es una variable creada desde VUE a REACT...3"
    );

} };

CREAR ARCHIVO EN REACT PARA RECIBIR LAS VARIABLES DEL LOCALSTORAGE DE VUE

//el componenDidMount se especifica el metodo que va recibir la informacion de
VUE para crear las variables en el localStorage

/\*_ @format _/

import React, { Component } from 'react' import { conectOtherDomain } from
'integration-cross-storage-domain'

class Emisor extends Component { componentDidMount() { conectOtherDomain() }
render() { return ( <div> <h1>RECIBIENDO LAS VARIABLES DE VUE</h1> </div> ) } }

export default Emisor

Tambien se puede aplicar a cualquier otra plataforma que utilice javascript
nativo
