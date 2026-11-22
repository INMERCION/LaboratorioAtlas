describe("ATLAS - Pruebas de seguridad por roles", () => {

  it("CP-SEG-01 - Inicio de sesión como Editor", () => {

    cy.visit("/login");

    cy.env(["EDITOR_USERNAME", "EDITOR_PASSWORD"]).then(
      ({ EDITOR_USERNAME, EDITOR_PASSWORD }) => {

        cy.get("input").eq(0).type(EDITOR_USERNAME);

        cy.get('input[type="password"]').type(
          EDITOR_PASSWORD,
          { log: false }
        );

        cy.contains("button", "Entrar").click();

        // Verificar autenticación
        cy.location("pathname", { timeout: 15000 })
          .should("eq", "/home");

        // Verificar que el rol mostrado sea Editor
        cy.contains("Editor", { matchCase: false })
          .should("be.visible");

        // Verificar que la sesión esté activa
        cy.contains("Cerrar Sesión")
          .should("be.visible");
      }
    );
  });


  
  it("CP-SEG-02 - Verificar consistencia del rol Editor", () => {

    cy.visit("/login");

    cy.env(["EDITOR_USERNAME", "EDITOR_PASSWORD"]).then(
      ({ EDITOR_USERNAME, EDITOR_PASSWORD }) => {

        cy.get("input").eq(0).type(EDITOR_USERNAME);

        cy.get('input[type="password"]').type(
          EDITOR_PASSWORD,
          { log: false }
        );

        cy.contains("button", "Entrar").click();

        // Esperar a que cargue el dashboard
        cy.location("pathname", { timeout: 15000 })
          .should("eq", "/home");

        cy.get("body", { timeout: 15000 })
          .should("contain.text", "Bienvenido, Editor");

        cy.get("body")
          .should("contain.text", "Cerrar Sesión");

        // Validar que el usuario Editor no figure como Administrador
        cy.get("body")
          .should("not.contain.text", "Administrador");

      }
    );

  });

  
it("CP-SEG-03 - Editor conserva su rol correcto", () => {
  cy.visit("/login");

  cy.env(["EDITOR_USERNAME", "EDITOR_PASSWORD"]).then(
    ({ EDITOR_USERNAME, EDITOR_PASSWORD }) => {

      cy.get('[data-testid="input-nombre-usuario"]')
        .type(EDITOR_USERNAME);

      cy.get('[data-testid="input-password"]')
        .type(EDITOR_PASSWORD, { log: false });

      cy.get('[data-testid="button-login"]').click();

      // Confirmar autenticación
      cy.location("pathname", { timeout: 15000 })
        .should("eq", "/home");

      // Comprobar el rol en el estado de autenticación
      cy.window().then((win) => {
        expect(win.localStorage.getItem("role"))
          .to.eq("editor");
      });

      // El menú administrativo no debe aparecer
      cy.get('[data-testid="link-nav-usuarios"]')
        .should("not.exist");

      // La sesión debe permanecer activa
      cy.get('[data-testid="button-layout-logout"]')
        .should("be.visible");
  });
});

});
