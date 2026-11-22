describe("Sistema ATLAS - Pruebas E2E", () => {

  it("CP-00 - Debe cargar la aplicación ATLAS", () => {

    // Abrir la aplicación
    cy.visit("/");

    // Verificar que se muestra el formulario de inicio de sesión
    cy.contains("Iniciar Sesión").should("be.visible");

    // Verificar los campos del formulario
    cy.contains("Nombre de usuario").should("be.visible");
    cy.contains("Contraseña").should("be.visible");

    // Verificar que existe el botón para ingresar
    cy.contains("button", "Entrar").should("be.visible");

  });
  
  it("CP-01A - Rechazar credenciales incorrectas", () => {
    cy.visit("/login");

    cy.get('input').eq(0).type("usuario_inexistente");
    cy.get('input[type="password"]').type("ClaveIncorrecta123");

    cy.contains("button", "Entrar").click();

    // El sistema debe permanecer fuera del área protegida.
    cy.url().should("include", "/login");

    // El formulario debe seguir disponible.
    cy.contains("Iniciar Sesión").should("be.visible");
  });


  
  it("CP-01B - Inicio de sesión con credenciales válidas", () => {
    cy.visit("/login");

    cy.env(["TEST_USERNAME", "TEST_PASSWORD"]).then(
      ({ TEST_USERNAME, TEST_PASSWORD }) => {

        expect(TEST_USERNAME, "Usuario configurado").to.be.a("string").and.not.be.empty;
        expect(TEST_PASSWORD, "Contraseña configurada").to.be.a("string").and.not.be.empty;

        // Ingresar credenciales de laboratorio
        cy.get('input').eq(0).type(TEST_USERNAME);
        cy.get('input[type="password"]').type(TEST_PASSWORD, {
          log: false
        });

        // Enviar formulario
        cy.contains("button", "Entrar").click();

        
        // Verificar que el login fue exitoso
        cy.location("pathname", { timeout: 15000 })
          .should("eq", "/home");

        // Esperar a que cargue el contenido del dashboard
        cy.get("body", { timeout: 15000 })
          .should("contain.text", "Bienvenido");

        // Comprobar que existe la opción de cerrar sesión
        cy.get("body")
          .should("contain.text", "Cerrar Sesión");
    
      }
    );
  });


});
