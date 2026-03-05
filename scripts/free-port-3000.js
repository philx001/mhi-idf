/**
 * Libère le port 3000 avant de lancer le serveur de dev.
 * Si le port est occupé, tue le processus. Sinon, ne fait rien.
 * Le script attend la fin avant de se terminer (pour que && next dev s'exécute après).
 */
const kill = require("kill-port");

kill(3000)
  .then(() => process.exit(0))
  .catch(() => process.exit(0));
