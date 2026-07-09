/**
 * Backup + dry-run de migración SM-2 → FSRS. SOLO LECTURA.
 *
 * No escribe nada en IndexedDB. No toca la app en producción. No requiere
 * ningún token de GitHub — lee directamente la IndexedDB del navegador
 * donde se ejecuta (misma base de datos y stores que usa la PWA real:
 * 'italiano-srs', object stores 'cards' y 'cardState').
 *
 * Cómo correrlo: ver pwa/tools/backup-y-preview-migracion.md
 */
(async () => {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open('italiano-srs', 1);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });

  const getAll = (store) => new Promise((res, rej) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });

  const states = await getAll('cardState');
  const cards  = await getAll('cards');
  const cardMap = {};
  cards.forEach(c => { cardMap[c.id] = c.keyword; });

  if (!states.length) {
    alert('No hay cardState en esta IndexedDB — ¿estás en la pestaña correcta del navegador donde hacés tus repasos reales?');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const download = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── 1. Backup — formato idéntico a anki-state.json, sin tocar nada ──
  const backupCards = {};
  for (const s of states) {
    backupCards[s.id] = {
      interval: s.interval, easeFactor: s.easeFactor, dueDate: s.dueDate,
      repetitions: s.repetitions, lapses: s.lapses,
    };
  }
  download(
    { meta: { exportedAt: new Date().toISOString(), deckVersion: 1, source: 'IndexedDB local — backup pre-migración FSRS' }, cards: backupCards },
    `anki-state-backup-sm2-${today}.json`
  );

  // ── 2. Dry-run de la migración — replica EXACTO migrateCardStateToFSRS() ──
  // sin llamar dbPutAll: solo calcula y muestra, no persiste nada.
  // D0(Again) = w4 - e^0 + 1 = w4 con los pesos default de ts-fsrs: 6.4133. No arbitrario —
  // es el valor real que FSRS asigna a una tarjeta fallada en su primer intento.
  const FAILED_NEVER_PASSED_DIFFICULTY = 6.4133;
  const State = { New: 0, Learning: 1, Review: 2, Relearning: 3 };
  const preview = states.map(s => {
    const isNew = s.repetitions === 0;
    const failedNotPassed = isNew && s.lapses > 0; // "caso architettura": fallada, nunca acertada
    return {
      id: s.id,
      keyword: cardMap[s.id] || s.id,
      before: { interval: s.interval, repetitions: s.repetitions, lapses: s.lapses, easeFactor: s.easeFactor, dueDate: s.dueDate },
      after: {
        state:      (isNew && !failedNotPassed) ? State.New : State.Review,
        stateLabel: (isNew && !failedNotPassed) ? 'New' : 'Review',
        due:        (isNew && !failedNotPassed) ? new Date().toISOString() : new Date(s.dueDate + 'T00:00:00').toISOString(),
        stability:  (isNew && !failedNotPassed) ? 0 : Math.max(s.interval, 0.1),
        difficulty: (isNew && !failedNotPassed) ? 0 : (failedNotPassed ? FAILED_NEVER_PASSED_DIFFICULTY : 5),
        reps:       s.repetitions || 0,
        lapses:     s.lapses || 0,
      },
    };
  });

  download(
    { generatedAt: new Date().toISOString(), totalCards: preview.length, note: 'DRY RUN — nada de esto fue escrito en IndexedDB.', preview },
    `fsrs-migration-preview-${today}.json`
  );

  // ── 3. Muestra representativa en consola: alto progreso, muchos lapses, casi nuevas ──
  const byInterval = [...preview].sort((a, b) => b.before.interval - a.before.interval).slice(0, 3);
  const byLapses    = [...preview].sort((a, b) => b.before.lapses - a.before.lapses).slice(0, 3);
  const nearNew     = preview.filter(p => p.before.repetitions <= 1).slice(0, 4);

  const seen = new Set();
  const sample = [...byInterval, ...byLapses, ...nearNew].filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  console.log(`Backup + preview generados. Total de tarjetas: ${states.length}`);
  console.table(sample.map(s => ({
    keyword:        s.keyword,
    'antes.interval':    s.before.interval,
    'antes.repetitions': s.before.repetitions,
    'antes.lapses':      s.before.lapses,
    'después.state':     s.after.stateLabel,
    'después.stability': s.after.stability,
    'después.difficulty':s.after.difficulty,
    'después.due':       s.after.due.slice(0, 10),
  })));

  alert(`Listo — se descargaron 2 archivos:\n1) anki-state-backup-sm2-${today}.json\n2) fsrs-migration-preview-${today}.json\n\nTotal tarjetas: ${states.length}\n\nAbrí la consola del navegador (F12) para ver la tabla de muestra, o revisá los archivos descargados.`);
})();
