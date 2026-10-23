/* =====================================================================
   CONTENIDO DEL CALENDARIO
   Este es el único archivo que necesitas tocar para rellenar los días.

   Tipos de día:
     mensaje    carta con fotos           titulo, texto[], fotos[]
     sobre      "abre el sobre X"         numero, titulo, texto[]
     post       algo de internet          titulo, texto[], enlace, boton, captura
     video      un vídeo                  titulo, texto[], youtube | archivo | enlace
     preguntas  para conocernos           titulo, intro, preguntas[]
     quiz       ¿cuánto me conoces?       titulo, preguntas[{p, o[], ok}], final
     memoria    juego de parejas          titulo, intro, simbolos[], premio

   Extras que valen para cualquier día:
     paquete: 3     añade al final "Abre ahora el sobre 3 del paquete"
     firma: false   quita la firma de ese día

   Fotos: guárdalas en la carpeta fotos/ y pon la ruta, p. ej. "fotos/dia01.jpg".
   Para vídeos de YouTube (pueden ser "ocultos"), pon solo el ID:
   en https://youtu.be/AbCdEf12345 el ID es "AbCdEf12345".

   Para probar en el móvil antes de diciembre, añade al final del enlace:
     #ensayo   todo abierto
     #hoy-7    simula que es 7 de diciembre
     #normal   vuelve a la fecha real
   ===================================================================== */

window.ADVIENTO = {
  anio: 2026,
  firma: "Isaac",

  dias: {
    1: {
      tipo: "mensaje",
      titulo: "Empieza la cuenta atrás",
      fotos: [
        { src: "", pie: "Nuestra primera foto juntos" }
      ],
      texto: [
        "Durante 24 días vas a abrir un sobre cada mañana. Algunos traen fotos, otros un juego, otros un recuerdo.",
        "Y unos cuantos te van a mandar a buscar algo en el paquete. Así estaré un poco ahí contigo cada día."
      ]
    },

    2: {
      tipo: "preguntas",
      titulo: "Preguntas para conocernos mejor",
      intro: "Esta noche, en la llamada, contestamos los dos. Pasa a la siguiente cuando terminemos cada una.",
      preguntas: [
        "¿Cuál es el primer recuerdo que tienes de mí?",
        "Si mañana tuviéramos el día libre en la misma ciudad, ¿qué plan harías?",
        "¿Qué canción te recuerda a nosotros?",
        "¿Qué es algo pequeño que hago y que te gusta más de lo que crees?",
        "¿A dónde te gustaría que viajáramos el año que viene?"
      ]
    },

    3: {
      tipo: "sobre",
      numero: 1,
      titulo: "Hoy toca paquete",
      texto: [
        "Ve al paquete y busca el sobre con el número 1.",
        "Los demás, quietos hasta su día 😉"
      ]
    },

    4: {
      tipo: "post",
      titulo: "Esto me hizo pensar en ti",
      texto: ["Me lo encontré el otro día y me acordé de ti al instante."],
      captura: { src: "", pie: "" },
      enlace: "https://example.com",
      boton: "Ver el post",
      paquete: 2
    },

    5: {
      tipo: "memoria",
      titulo: "Juego de parejas",
      intro: "Encuentra todas las parejas para descubrir el premio de hoy.",
      simbolos: ["★", "♥", "❄", "☾", "✿", "♪"],
      premio: "Vale por una noche de peli elegida por ti, con manta y palomitas, la próxima vez que nos veamos."
    },

    6: {
      tipo: "video",
      titulo: "Un vídeo para hoy",
      texto: ["Grabé esto para ti. Ponte los cascos."],
      youtube: "",                       // p. ej. "AbCdEf12345"
      enlace: "https://example.com",      // se usa si no hay youtube
      boton: "Ver el vídeo"
    },

    7: {
      tipo: "quiz",
      titulo: "¿Cuánto me conoces?",
      preguntas: [
        { p: "¿Cuál es mi comida favorita?", o: ["Pizza", "Paella", "Sushi", "Tortilla de patatas"], ok: 1 },
        { p: "¿Dónde fue nuestra primera cita?", o: ["En un bar", "En el cine", "Paseando", "En un restaurante"], ok: 2 },
        { p: "¿Qué haría yo un domingo perfecto?", o: ["Fútbol y sofá", "Ir a la montaña", "Dormir hasta las 12", "Todo lo anterior"], ok: 3 }
      ],
      final: "Da igual la nota: me debes una respuesta a la pregunta que más te costó."
    }

    // 8: { tipo: "mensaje", titulo: "...", texto: ["..."], fotos: [{ src: "fotos/dia08.jpg", pie: "..." }] },
  }
};
