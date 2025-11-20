* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #111; color: #eee; }
.grid { display: grid; grid-template-columns: 2fr 1fr; height: 100vh; gap: 4px; }
.menu { background: #222; padding: 1rem; overflow-y: auto; }
.ticket { background: #333; padding: 1rem; display: flex; flex-direction: column; }
.card { background: #444; padding: .5rem; margin-bottom: .5rem; border-radius: 6px; }
button { margin: 2px; padding: .4rem .8rem; border: none; border-radius: 4px; background: #0af; color: #fff; cursor: pointer; }
button:hover { background: #08c; }
hr { margin: .8rem 0; border: 1px solid #555; }
h2 { margin-bottom: .5rem; }