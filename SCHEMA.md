# Formato de contenido — Azure Quest (AZ-900, temario 20-jul-2026)

Cada archivo `content/wN.js` es JavaScript plano (sin import/export) y hace:

```js
(window.AZ = window.AZ || { worlds: [] }).worlds.push({
  id: 'w1', order: 1,
  title: 'Conceptos de nube', weight: '25-30 %', share: 0.275,   // share = peso medio para el simulacro
  levels: [ /* niveles en orden */ ]
});
```

## Nivel
```js
{ id: 'w1l1', title: 'Informática en la nube', minutes: 6,
  goal: 'Una frase: qué sabrás hacer al terminar',
  lesson: [ /* 6-12 bloques, ver abajo */ ],
  questions: [ /* 24-30 preguntas, ver abajo */ ] }
```

## Bloques de lección (tipo `type`)
Texto: soporta **negrita**, `código` y saltos de línea con \n. Nada de HTML.
- `{type:'text', title?, body}` — explicación breve (máx ~60 palabras).
- `{type:'cards', title?, items:[{title, body}]}` — 2-6 tarjetas que se deslizan (concepto por tarjeta, body ≤ 30 palabras).
- `{type:'flip', title?, items:[{front, back}]}` — tarjetas que se voltean al tocar (término → definición).
- `{type:'compare', title?, head:['', 'A', 'B'], rows:[['Criterio','x','y'], ...]}` — tabla comparativa, celdas cortas.
- `{type:'analogy', body}` — analogía de la vida real (una).
- `{type:'trap', body}` — trampa típica del examen (lo que confunde a la gente).
- `{type:'sort', title, buckets:['IaaS','PaaS','SaaS'], items:[{text, bucket:0}]}` — clasificar tocando (bucket = índice). 4-8 items.
- `{type:'order', title, items:['primero','segundo',...]}` — ordenar (se dan en orden correcto; la app los mezcla). 3-6 items.
- `{type:'check', q, o:['a','b','c'], a:1, why}` — mini pregunta dentro de la lección.
- `{type:'keypoints', items:['...']}` — "Para el examen recuerda" (3-6 frases cortas). Debe ser el ÚLTIMO bloque.

Cada nivel debe tener al menos: 1 cards o flip, 1 interactivo (sort/order/check), 1 trap y keypoints al final. Usa compare cuando haya servicios parecidos.

## Preguntas (campo `t`)
Todas llevan `why` (explicación: por qué la correcta lo es y por qué las otras no, ≤ 60 palabras) y `d` dificultad 1-3.
- `{t:'single', q, o:[4 opciones], a:2, why, d}`
- `{t:'multi', q:'... Selecciona dos.', o:[4-5], a:[0,3], why, d}` — la cantidad pedida en q debe coincidir con a.length.
- `{t:'yn', q:'Para cada afirmación, selecciona Sí o No.', s:[{text, a:true}, {text,a:false}, {text,a:true}], why, d}` — exactamente 3.
- `{t:'drop', q:'Texto con ___ en el hueco.', o:[3-4], a:0, why, d}` — completar frase; q contiene exactamente un "___".
- `{t:'match', q, pairs:[['Izquierda','Derecha'], ...], why, d}` — 3-4 pares; derechas únicas.

Mezcla por nivel: ~50% single, ~15% multi, ~15% yn, ~10% drop, ~10% match. Varias deben ser escenarios ("Una empresa necesita…").
Opciones plausibles, nada de "todas las anteriores". La respuesta correcta no siempre en la misma posición.
Idioma: español neutro, con nombres de servicios como en el examen en español (Microsoft Entra ID, Azure Policy, conjuntos de escalado de máquinas virtuales…).
Precisión técnica: estado actual de Azure (Entra ID, no "Azure AD"; Microsoft Defender for Cloud; Microsoft Purview; Azure Arc; Bicep).
Preguntas ORIGINALES, no copiadas de dumps ni de la evaluación oficial.
