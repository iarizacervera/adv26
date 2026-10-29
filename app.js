/* Lógica del calendario. No hace falta tocar este archivo: el contenido está en contenido.js */
(function () {
  "use strict";
  var C = window.ADVIENTO || {};
  var YEAR = C.anio || new Date().getFullYear();
  var DIAS = C.dias || {};
  var FIRMA = C.firma || "";
  var TIPOS = { mensaje: "Una carta", sobre: "Del paquete", post: "Encontrado para ti", video: "Un vídeo",
                preguntas: "Para conocernos", quiz: "Un juego", memoria: "Un juego", historia: "Una historia" };
  var SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- modo de prueba y sobres vistos ---- */
  var modo = { ensayo: false, hoy: null };
  try { var m = JSON.parse(sessionStorage.getItem("adv-modo") || "null"); if (m) modo = m; } catch (e) {}
  function guardarModo() { try { sessionStorage.setItem("adv-modo", JSON.stringify(modo)); } catch (e) {} }
  var vistos = {};
  try { vistos = JSON.parse(localStorage.getItem("adv-vistos") || "{}") || {}; } catch (e) {}
  function marcarVisto(n) { vistos[n] = 1; try { localStorage.setItem("adv-vistos", JSON.stringify(vistos)); } catch (e) {} }

  /* ---- fechas (siempre en hora de Madrid) ---- */
  function hoy() {
    if (modo.hoy) return { y: YEAR, m: 12, d: modo.hoy };
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
    function g(t) { for (var i = 0; i < p.length; i++) if (p[i].type === t) return +p[i].value; }
    return { y: g("year"), m: g("month"), d: g("day") };
  }
  function clave(y, m, d) { return y * 10000 + m * 100 + d; }
  function abierto(n) { if (modo.ensayo) return true; var t = hoy(); return clave(t.y, t.m, t.d) >= clave(YEAR, 12, n); }
  function numHoy() { var t = hoy(); return (t.y === YEAR && t.m === 12 && t.d <= 24) ? t.d : 0; }
  function diasHastaInicio() { var t = hoy(); return Math.round((Date.UTC(YEAR, 11, 1) - Date.UTC(t.y, t.m - 1, t.d)) / 864e5); }
  function fecha(n) { return SEMANA[new Date(Date.UTC(YEAR, 11, n, 12)).getUTCDay()] + " " + n + " de diciembre"; }

  /* ---- avisos ---- */
  var tt;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 2600); }

  /* ---- pantalla de inicio ---- */
  function sobre(n, cls) { return '<span class="env ' + (cls || "") + '"><span class="flap"></span><span class="seal">' + n + '</span></span>'; }

  function pintarInicio() {
    $("#ano").textContent = "Diciembre " + YEAR;
    var av = $("#aviso");
    if (modo.ensayo) { av.textContent = "Modo ensayo: todo abierto"; av.hidden = false; }
    else if (modo.hoy) { av.textContent = "Simulando el " + modo.hoy + " de diciembre"; av.hidden = false; }
    else av.hidden = true;

    var tn = numHoy(), falta = diasHastaInicio(), h = $("#hoy");
    if (tn) {
      var v = vistos[tn];
      h.innerHTML = '<a class="hoy-card" href="#dia-' + tn + '">' + sobre(tn, "today" + (v ? " opened" : "")) +
        '<span class="hoy-txt"><span class="k">Hoy, ' + fecha(tn) + '</span>' +
        '<span class="t">' + (v ? "Ya lo has abierto" : "Tienes un sobre nuevo") + '</span>' +
        '<span class="btn">' + (v ? "Volver a leerlo" : "Abrir") + '</span></span></a>';
      h.querySelector("a").onclick = function (e) { e.preventDefault(); irA(tn); };
    } else if (falta > 0) {
      h.innerHTML = '<div class="hoy-card"><span class="big-n">' + falta + '</span><span class="hoy-txt">' +
        '<span class="k">' + (falta === 1 ? "Falta 1 día" : "Faltan " + falta + " días") + '</span>' +
        '<span class="t">para abrir el primer sobre</span>' +
        '<span class="sub">El ' + fecha(1) + ', a medianoche.</span></span></div>';
    } else {
      h.innerHTML = '<div class="hoy-card"><span class="hoy-txt"><span class="k">25 de diciembre</span>' +
        '<span class="t">Feliz Navidad. Ya están abiertos los 24.</span>' +
        '<span class="sub">Puedes volver a cualquiera cuando quieras.</span></span></div>';
    }

    var g = $("#sobres"); g.innerHTML = "";
    for (var n = 1; n <= 24; n++) (function (n) {
      var ab = abierto(n), b = document.createElement("button");
      b.type = "button";
      b.className = "env" + (ab ? "" : " locked") + (n === tn ? " today" : "") + (ab && vistos[n] ? " opened" : "") + (ab && !vistos[n] ? " nuevo" : "");
      b.innerHTML = '<span class="flap"></span><span class="seal">' + n + '</span>';
      b.setAttribute("aria-label", ab ? "Abrir el día " + n : "Día " + n + ", se abre el " + fecha(n));
      b.onclick = ab ? function () { irA(n); } : function () { toast("Este se abre el " + fecha(n)); };
      g.appendChild(b);
    })(n);
  }

  /* ---- contenido de cada día ---- */
  /* Un párrafo que empieza por · • - o * (con o sin espacios delante) se pinta como elemento de lista */
  function par(t, cls) {
    var m = String(t).match(/^\s*[·•\-–*]\s+([\s\S]*)$/);
    if (m) return '<p class="li' + (cls ? " " + cls : "") + '">' + esc(m[1]) + "</p>";
    return "<p" + (cls ? ' class="' + cls + '"' : "") + ">" + esc(t) + "</p>";
  }
  function parrafos(a) { return (a || []).map(function (t) { return par(t); }).join(""); }
  function foto(f, i) {
    if (typeof f === "string") f = { src: f };
    f = f || {};
    return '<figure class="polaroid' + (f.pie ? " cap" : "") + '" style="--r:' + (i % 2 ? 1.2 : -1.2) + 'deg">' +
      (f.src ? '<img src="' + esc(f.src) + '" alt="' + esc(f.pie || "Foto") + '" loading="lazy">' : '<span class="ph">Aquí irá una foto</span>') +
      (f.pie ? "<figcaption>" + esc(f.pie) + "</figcaption>" : "") + "</figure>";
  }
  /* historia: texto y fotos mezclados, sin marco */
  function imgLibre(src, pie) {
    return '<img src="' + esc(src) + '" alt="' + esc(pie || "Foto") + '" loading="lazy">';
  }
  function bloque(b) {
    if (typeof b === "string") return par(b, "h-txt");
    var s = "";
    if (b.texto) s += (Array.isArray(b.texto) ? b.texto : [b.texto]).map(function (t) { return par(t, "h-txt"); }).join("");
    if (b.titulo) s += '<h3 class="h-sub">' + esc(b.titulo) + "</h3>";
    if (b.foto) s += '<figure class="h-foto">' + imgLibre(b.foto, b.pie) + (b.pie ? "<figcaption>" + esc(b.pie) + "</figcaption>" : "") + "</figure>";
    if (b.fotos) s += '<div class="h-fotos">' + b.fotos.map(function (f) {
      if (typeof f === "string") f = { src: f };
      return '<figure class="h-foto">' + imgLibre(f.src, f.pie) + (f.pie ? "<figcaption>" + esc(f.pie) + "</figcaption>" : "") + "</figure>";
    }).join("") + "</div>";
    return s;
  }
  function boton(url, txt, cls) { return '<a class="btn ' + (cls || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(txt) + "</a>"; }

  function cuerpo(d) {
    var t = "<h2>" + esc(d.titulo || "") + "</h2>";
    switch (d.tipo) {
      case "sobre":
        return t + '<div class="bigno">' + esc(d.numero) + '</div><div class="hand">' + parrafos(d.texto) + "</div>";
      case "post":
        return t + parrafos(d.texto) + (d.captura ? foto(d.captura, 0) : "") +
          (d.enlace ? '<div class="row">' + boton(d.enlace, (d.boton || "Abrir") + " ↗") + "</div>" : "");
      case "video":
        var v;
        if (d.youtube) v = '<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(d.youtube) + '?rel=0&playsinline=1" title="Vídeo" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>' +
          '<div class="row">' + boton("https://youtu.be/" + d.youtube, "Abrir en YouTube ↗", "ghost") + "</div>";
        else if (d.archivo) v = '<video class="vid-file" controls playsinline preload="metadata" src="' + esc(d.archivo) + '"></video>';
        else v = foto({ src: d.miniatura || "" }, 0) + (d.enlace ? '<div class="row">' + boton(d.enlace, "▶ " + (d.boton || "Ver el vídeo")) + "</div>" : "");
        return t + parrafos(d.texto) + v;
      case "preguntas":
        return t + "<p>" + esc(d.intro || "") + '</p><div class="qcard" id="qc"></div>' +
          '<div class="qnav"><span class="qcount" id="qn"></span><span class="row" style="margin:0">' +
          '<button type="button" class="btn ghost" id="qp">Anterior</button><button type="button" class="btn" id="qx">Siguiente</button></span></div>';
      case "historia":
        return t + '<div class="historia' + (d.mano ? " mano" : "") + '">' + (d.bloques || []).map(bloque).join("") + "</div>";
      case "quiz":
        return t + '<div id="quiz"></div>';
      case "memoria":
        return t + "<p>" + esc(d.intro || "") + '</p><div class="mem" id="mem"></div><div id="memr"></div>';
      default:
        return t + (d.fotos || []).map(foto).join("") + '<div class="hand">' + parrafos(d.texto) + "</div>";
    }
  }
  function extras(d) {
    var s = "";
    if (d.paquete && d.tipo !== "sobre") s += '<div class="stamp"><b>' + esc(d.paquete) + "</b><span>Y ahora, abre el sobre " + esc(d.paquete) + " del paquete.</span></div>";
    var f = typeof d.firma === "string" ? d.firma : (d.firma === false ? "" : (["mensaje", "sobre", "video", "post", "historia"].indexOf(d.tipo || "mensaje") >= 0 ? FIRMA : ""));
    if (f) s += '<div class="sign">— ' + esc(f) + "</div>";
    return s;
  }

  /* sangría en la primera línea de cada párrafo (solo en días de texto) */
  function conSangria(d) {
    var tipo = d.tipo || "mensaje";
    if (["mensaje", "sobre", "post", "video", "historia"].indexOf(tipo) < 0) return false;
    return d.sangria != null ? !!d.sangria : !!C.sangria;
  }

  var scrollInicio = 0, desdeInicio = false;
  function mostrarDia(n) {
    if (!$("#inicio").hidden) scrollInicio = window.scrollY;
    var d = DIAS[n] || { tipo: "mensaje", titulo: "Sobre por rellenar", texto: ["Aún no hay nada para el día " + n + ". Se rellena en contenido.js."], firma: false };
    var prev = n > 1 && abierto(n - 1) ? n - 1 : 0, next = n < 24 && abierto(n + 1) ? n + 1 : 0;
    $("#dia").innerHTML =
      '<div class="daybar"><button type="button" class="back" id="volver">← Sobres</button><div class="nav">' +
      '<button type="button" class="navb" id="ant" aria-label="Día anterior"' + (prev ? "" : " disabled") + ">‹</button>" +
      '<span class="navd">' + n + " dic</span>" +
      '<button type="button" class="navb" id="sig" aria-label="Día siguiente"' + (next ? "" : " disabled") + ">›</button></div></div>" +
      '<article class="sheet' + (conSangria(d) ? " sangria" : "") + '"><header class="dayhead"><span class="d">' + n + '</span><span class="k">' + esc(TIPOS[d.tipo] || TIPOS.mensaje) + "<br>" + fecha(n) + "</span></header>" +
      cuerpo(d) + extras(d) + "</article>";
    $("#inicio").hidden = true; $("#dia").hidden = false; window.scrollTo(0, 0);
    $("#volver").onclick = volver;
    if (prev) $("#ant").onclick = function () { location.replace("#dia-" + prev); };
    if (next) $("#sig").onclick = function () { location.replace("#dia-" + next); };
    if (d.tipo === "preguntas") preguntas(d.preguntas || []);
    if (d.tipo === "quiz") quiz(d);
    if (d.tipo === "memoria") memoria(d);
    marcarVisto(n);
  }
  function mostrarInicio() {
    var venia = !$("#dia").hidden;
    $("#dia").hidden = true; $("#inicio").hidden = false; $("#dia").innerHTML = "";
    pintarInicio(); desdeInicio = false;
    if (venia) window.scrollTo(0, scrollInicio);
  }

  /* ---- juegos ---- */
  function preguntas(q) {
    var i = 0, c = $("#qc"), nEl = $("#qn"), p = $("#qp"), x = $("#qx");
    function draw() { c.textContent = q[i] || ""; nEl.textContent = (i + 1) + " de " + q.length; p.disabled = i === 0; x.textContent = i === q.length - 1 ? "Volver a la primera" : "Siguiente"; }
    p.onclick = function () { if (i > 0) { i--; draw(); } };
    x.onclick = function () { i = (i + 1) % q.length; draw(); };
    draw();
  }
  function quiz(d) {
    var box = $("#quiz"), i = 0, score = 0, Q = d.preguntas || [];
    function draw() {
      if (i >= Q.length) {
        box.innerHTML = '<div class="bigno" style="font-size:72px">' + score + "/" + Q.length + '</div><div class="reveal hand">' + esc(d.final || "") +
          '</div><div class="row" style="margin-top:14px"><button type="button" class="btn ghost" id="qr">Repetir</button></div>';
        $("#qr").onclick = function () { i = 0; score = 0; draw(); };
        return;
      }
      var q = Q[i];
      box.innerHTML = '<p class="qcount">Pregunta ' + (i + 1) + " de " + Q.length + '</p><p class="quiz-q">' + esc(q.p) + '</p><div class="opts">' +
        q.o.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + esc(o) + "</button>"; }).join("") + '</div><div id="nx"></div>';
      Array.prototype.forEach.call(box.querySelectorAll(".opt"), function (b) {
        b.onclick = function () {
          if (+b.dataset.k === q.ok) score++;
          Array.prototype.forEach.call(box.querySelectorAll(".opt"), function (o) {
            o.disabled = true;
            if (+o.dataset.k === q.ok) o.classList.add("ok"); else if (o === b) o.classList.add("bad");
          });
          var nb = document.createElement("button"); nb.type = "button"; nb.className = "btn";
          nb.textContent = i === Q.length - 1 ? "Ver resultado" : "Siguiente";
          nb.onclick = function () { i++; draw(); };
          $("#nx").appendChild(nb);
        };
      });
    }
    draw();
  }
  function memoria(d) {
    var m = $("#mem"), r = $("#memr"), S = d.simbolos || [];
    var deck = S.concat(S).map(function (s) { return { s: s, r: Math.random() }; }).sort(function (a, b) { return a.r - b.r; }).map(function (x) { return x.s; });
    var up = [], lock = false, done = 0;
    deck.forEach(function (s) {
      var c = document.createElement("button"); c.type = "button"; c.className = "card";
      c.innerHTML = '<span class="s">' + esc(s) + "</span>"; c.setAttribute("aria-label", "Carta tapada");
      c.onclick = function () {
        if (lock || c.classList.contains("up") || c.classList.contains("done")) return;
        c.classList.add("up"); c.setAttribute("aria-label", s); up.push(c);
        if (up.length < 2) return;
        lock = true; var a = up[0], b = up[1];
        if (a.textContent === b.textContent) {
          setTimeout(function () {
            a.classList.add("done"); b.classList.add("done"); up = []; lock = false; done++;
            if (done === S.length) r.innerHTML = '<div class="reveal hand">' + esc(d.premio || "") + "</div>";
          }, 250);
        } else {
          setTimeout(function () {
            [a, b].forEach(function (x) { x.classList.remove("up"); x.setAttribute("aria-label", "Carta tapada"); });
            up = []; lock = false;
          }, 800);
        }
      };
      m.appendChild(c);
    });
  }

  /* ---- navegación (el botón atrás del móvil vuelve a los sobres) ---- */
  function irA(n) { desdeInicio = true; location.hash = "dia-" + n; }
  function volver() { if (desdeInicio) history.back(); else location.hash = "inicio"; }
  function ruta() {
    var h = location.hash.replace(/^#/, ""), mh;
    if (h === "ensayo") { modo = { ensayo: true, hoy: null }; guardarModo(); }
    else if (h === "normal") { modo = { ensayo: false, hoy: null }; guardarModo(); }
    else if ((mh = h.match(/^hoy-(\d{1,2})$/))) { modo = { ensayo: false, hoy: Math.min(25, Math.max(1, +mh[1])) }; guardarModo(); }
    var md = h.match(/^dia-(\d{1,2})$/), n = md ? +md[1] : 0;
    if (n >= 1 && n <= 24 && abierto(n)) mostrarDia(n); else mostrarInicio();
  }
  window.addEventListener("hashchange", ruta);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#dia").hidden) volver(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !$("#inicio").hidden) pintarInicio(); });

  /* ---- nieve ---- */
  (function () {
    var cv = $("#nieve");
    if (!cv || !cv.getContext || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var cx = cv.getContext("2d"), W, H, f = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      f = []; for (var i = 0; i < Math.min(110, W / 6); i++) f.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .6, v: Math.random() * .45 + .2, w: Math.random() * 6.28 });
    }
    size(); addEventListener("resize", size);
    (function tick() {
      cx.clearRect(0, 0, W, H); cx.fillStyle = "rgba(239,229,211,.65)";
      for (var i = 0; i < f.length; i++) { var p = f[i]; p.y += p.v; p.w += .01; p.x += Math.sin(p.w) * .3; if (p.y > H) { p.y = -4; p.x = Math.random() * W; } cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28); cx.fill(); }
      requestAnimationFrame(tick);
    })();
  })();

  ruta();
})();
