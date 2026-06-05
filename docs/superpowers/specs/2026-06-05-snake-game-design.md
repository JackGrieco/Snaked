# Snake Game Aziendale — Design Spec

**Data:** 2026-06-05  
**Tipo:** Mini-gioco evento aziendale  
**Deploy target:** Netlify (link pubblico)

---

## Contesto

Mini-gioco Snake personalizzato con il brand aziendale, accessibile via link pubblico durante un evento. Nessun backend, nessuna classifica condivisa — single player, completamente statico.

---

## File Structure

```
snake-game/
├── index.html   # markup + schermate
├── style.css    # stile brand, layout, D-pad
├── game.js      # logica Snake, canvas, rewards
└── D.png        # logo aziendale (food nel gioco)
```

Deploy: tutti e 4 i file caricati su Netlify via drag & drop.

---

## Brand & Visual

| Elemento        | Valore         |
|-----------------|----------------|
| Sfondo          | `#3e00ea`      |
| Serpente        | `#ffffff`      |
| Testo / UI      | `#ffffff`      |
| Food            | `D.png` (logo) |
| Font            | system-ui      |

---

## Schermate

### 1. Start Screen
- Sfondo `#3e00ea` full screen
- Logo `D.png` al centro
- Pulsante "Inizia" bianco
- Tap/click avvia il gioco

### 2. Gioco
- Canvas quadrato, larghezza = `min(viewport width, viewport height - spazio D-pad)`, altezza = larghezza
- Cella = larghezza canvas / 20 (scala automatica a qualsiasi schermo)
- Score in alto (`PUNTEGGIO: N`)
- D-pad in basso, pulsanti ≥ 48px (touch-friendly)
- Controlli tastiera (frecce) supportati per testing desktop
- Viewport `user-scalable=no` — nessuno zoom accidentale
- Velocità iniziale: 200ms/tick, −10ms ogni 5 punti (min 80ms)

### 3. Game Over
- Punteggio finale in grande
- Se il punteggio raggiunge una soglia → messaggio gadget vinto
- Pulsante "Rigioca"

---

## Configurazione Rewards

Array in cima a `game.js`, facilmente modificabile:

```js
const REWARDS = [
  { minScore: 10, prize: "Gadget A" },
  { minScore: 25, prize: "Gadget B" },
  { minScore: 50, prize: "Gadget C" },
]
```

Logica: si mostra il premio corrispondente alla soglia **più alta raggiunta**. Se sotto la soglia minima, nessun messaggio premio.

---

## Meccanica di Gioco

- Griglia: 20×20 celle quadrate
- La `D.png` viene pre-caricata e disegnata nel canvas come food
- Collisione con muri o sé stesso → transizione a Game Over
- Il serpente cresce di 1 cella per ogni food mangiato
- Score = numero di food mangiati

---

## Controlli

| Controllo       | Azione        |
|-----------------|---------------|
| D-pad ▲         | Su            |
| D-pad ▼         | Giù           |
| D-pad ◀         | Sinistra      |
| D-pad ▶         | Destra        |
| Frecce tastiera | Stesse azioni |

Il serpente non può invertire la direzione su sé stesso (180°).

---

## Vincoli Tecnici

- Nessun framework, nessuna dipendenza esterna
- Funziona offline (tutti gli asset locali)
- Ottimizzato per mobile/tablet (touch events)
- Nessun backend, nessun cookie, nessun dato utente salvato
- `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`

---

## Non in Scope

- Classifica condivisa
- Multiplayer
- Autenticazione
- Analytics
- Suoni / musica
