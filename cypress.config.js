const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3350",
    setupNodeEvents(on, config) {
      // Configuración de eventos
    },
  },
});