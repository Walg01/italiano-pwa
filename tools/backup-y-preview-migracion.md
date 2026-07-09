# Backup + dry-run de migración FSRS — instrucciones

> Corresponde a [srs-backup-preview.js](srs-backup-preview.js). Solo lectura: no escribe nada en IndexedDB, no toca `anki-state.json`, no requiere token de GitHub. Se puede correr contra la app **actualmente desplegada** (SM-2, sin migrar) sin ningún riesgo.

## Por qué esto lo corrés vos, no Claude

Tus ~1001 tarjetas viven en la IndexedDB del navegador donde hacés tus repasos reales (probablemente el celular) — un dato local a ese dispositivo/navegador, sin backend. Claude Code no tiene acceso a ese navegador. La única copia remota (`anki-state.json` en `walg01/italiano-data`) está en un repo privado — confirmado al intentar leerlo sin token (devuelve 404, típico de GitHub para repos privados). Sin tu token no hay forma de leerlo desde acá. Por eso el script se corre en tu propio navegador, con tus propios datos, sin compartir nada conmigo salvo lo que vos decidas pegarme de vuelta.

## Paso 1 — Instalar el bookmarklet

1. Creá un marcador nuevo en el navegador donde hacés tus repasos reales (cualquier página sirve como destino temporal, ej. `google.com`).
2. Editá la URL del marcador y pegá esto completo (es una sola línea, empieza con `javascript:`):

```
javascript:(async()=>{const db=await new Promise((res,rej)=>{const req=indexedDB.open('italiano-srs',1);req.onsuccess=e=>res(e.target.result);req.onerror=e=>rej(e.target.error);});const getAll=(store)=>new Promise((res,rej)=>{const tx=db.transaction(store,'readonly');const req=tx.objectStore(store).getAll();req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error);});const states=await getAll('cardState');const cards=await getAll('cards');const cardMap={};cards.forEach(c=>{cardMap[c.id]=c.keyword;});if(!states.length){alert('No hay cardState en esta IndexedDB.');return;}const today=new Date().toISOString().slice(0,10);const download=(obj,filename)=>{const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();};const backupCards={};for(const s of states){backupCards[s.id]={interval:s.interval,easeFactor:s.easeFactor,dueDate:s.dueDate,repetitions:s.repetitions,lapses:s.lapses};}download({meta:{exportedAt:new Date().toISOString(),deckVersion:1,source:'IndexedDB local backup pre-FSRS'},cards:backupCards},'anki-state-backup-sm2-'+today+'.json');const State={New:0,Learning:1,Review:2,Relearning:3};const preview=states.map(s=>{const isNew=s.repetitions===0;return{id:s.id,keyword:cardMap[s.id]||s.id,before:{interval:s.interval,repetitions:s.repetitions,lapses:s.lapses,easeFactor:s.easeFactor,dueDate:s.dueDate},after:{state:isNew?State.New:State.Review,stateLabel:isNew?'New':'Review',due:isNew?new Date().toISOString():new Date(s.dueDate+'T00:00:00').toISOString(),stability:isNew?0:Math.max(s.interval,0.1),difficulty:isNew?0:5,reps:s.repetitions||0,lapses:s.lapses||0}};});download({generatedAt:new Date().toISOString(),totalCards:preview.length,note:'DRY RUN',preview},'fsrs-migration-preview-'+today+'.json');const byInterval=[...preview].sort((a,b)=>b.before.interval-a.before.interval).slice(0,3);const byLapses=[...preview].sort((a,b)=>b.before.lapses-a.before.lapses).slice(0,3);const nearNew=preview.filter(p=>p.before.repetitions<=1).slice(0,4);const seen=new Set();const sample=[...byInterval,...byLapses,...nearNew].filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true;});console.log('Backup + preview generados. Total: '+states.length);console.table(sample.map(s=>({keyword:s.keyword,antes_interval:s.before.interval,antes_repetitions:s.before.repetitions,antes_lapses:s.before.lapses,despues_state:s.after.stateLabel,despues_stability:s.after.stability,despues_difficulty:s.after.difficulty,despues_due:s.after.due.slice(0,10)})));alert('Listo. Se descargaron 2 archivos. Total tarjetas: '+states.length+'. Abri la consola para ver la tabla de muestra.');})();
```

3. Guardá el marcador con un nombre tipo `SRS backup+preview`.

**Nota Chrome:** si al pegar en la barra de direcciones/marcador Chrome borra el prefijo `javascript:`, escribí `javascript:` a mano primero y después pegá el resto — es una protección de seguridad del navegador, no un error tuyo.

## Paso 2 — Correrlo

1. Abrí `https://walg01.github.io/italiano-pwa/` en el **mismo navegador/dispositivo donde hacés tus repasos reales** (si lo abrís en otro dispositivo, vas a leer una IndexedDB distinta — probablemente vacía).
2. Andá a la pestaña **Tarjetas** (no hace falta iniciar sesión ni tocar nada más).
3. Tocá el marcador `SRS backup+preview`.
4. Deberían descargarse 2 archivos y aparecer un cartel de confirmación con el total de tarjetas.

**Si estás en el celular y bookmarklets no funcionan bien** (pasa en algunos navegadores móviles): abrí la misma URL en un navegador de escritorio *donde también tengas sincronizados tus datos reales* — si nunca usaste esa PWA en esa compu, su IndexedDB va a estar vacía y esto no sirve. En ese caso avisame y armamos un botón dentro de la app en vez del bookmarklet (requiere un deploy chico, separado del cambio grande de FSRS).

## Paso 3 — Qué revisar

- **Archivo 1** `anki-state-backup-sm2-<fecha>.json` — tu respaldo, formato SM-2 idéntico al `anki-state.json` real. Guardalo en un lugar seguro (no hace falta subirlo a ningún lado).
- **Archivo 2** `fsrs-migration-preview-<fecha>.json` — el resultado completo de la migración para las ~1001 tarjetas, sin haber tocado nada real.
- **Consola del navegador** (F12 en desktop) — tabla con 8-9 tarjetas de muestra: 3 de mayor progreso, 3 con más lapses, y hasta 4 casi nuevas.
- Pegame acá el contenido de la tabla (o un screenshot) y lo revisamos juntos antes de decidir si migramos de verdad.

## Cosa a tener en ojo al revisar

La regla de migración acordada es `repetitions > 0 → Review, si no → New`. Esto significa que una tarjeta que fallaste muchas veces pero **nunca llegaste a acertar ni una vez** (repetitions se queda en 0 en SM-2 aunque tenga 5-7 lapses) migra como si fuera **completamente nueva** — `stability: 0, difficulty: 0` — perdiendo la señal de "esto me cuesta". El conteo de `lapses` sí se preserva en el registro migrado, pero FSRS no lo usa como input para `difficulty`/`stability` de una tarjeta en estado New. Si al ver la muestra te parece mal para tus palabras más problemáticas, decímelo — es un ajuste chico a la heurística de migración, no al diseño general.
