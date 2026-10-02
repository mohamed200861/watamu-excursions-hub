export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Pagina momentaneamente non disponibile</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #FBF8F3; color: #093F20; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #3d4a40; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #093F20; color: #fff; }
      .secondary { background: #fff; color: #093F20; border-color: #093F20; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Pagina momentaneamente non disponibile</h1>
      <p>Si è verificato un problema temporaneo. Riprova tra poco oppure scrivici su WhatsApp.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Riprova</button>
        <a class="secondary" href="/">Torna alla home</a>
        <a class="secondary" href="https://wa.me/254742161072">WhatsApp</a>
      </div>
    </div>
  </body>
</html>`;
}
