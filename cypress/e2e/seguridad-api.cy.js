describe("ATLAS - Seguridad de API", () => {

  it("CP-SEG-04 - Verificar acceso anónimo a roles", () => {

    // Consultar la API sin enviar un token JWT
    cy.request({
      method: "GET",
      url: "http://localhost:4450/roles",
      failOnStatusCode: false
    }).then((response) => {

      cy.log("Código HTTP: " + response.status);

      // Un endpoint protegido debe rechazar
      // las solicitudes sin autenticación
      expect(response.status).to.eq(401);

    });

  });

  it("CP-SEG-05 - Verificar acceso anónimo a usuarios", () => {

    cy.request({
      method: "GET",
      url: "http://localhost:4450/usuarios",
      failOnStatusCode: false
    }).then((response) => {

      cy.log("Código HTTP: " + response.status);

      // El listado de usuarios debe requerir autenticación
      expect(response.status).to.eq(401);

    });

  });

  it("CP-SEG-06 - Editor no puede eliminar usuarios", () => {
    cy.env(["EDITOR_USERNAME", "EDITOR_PASSWORD"]).then(
      ({ EDITOR_USERNAME, EDITOR_PASSWORD }) => {

        cy.request({
          method: "POST",
          url: "http://localhost:4450/autenticacion/login",
          body: {
            nombre_usuario: EDITOR_USERNAME,
            password: EDITOR_PASSWORD
          }
        }).then((loginResponse) => {

          expect(loginResponse.status).to.eq(200);

          const token = loginResponse.body.token;
          expect(token).to.be.a("string").and.not.be.empty;

          cy.request({
            method: "DELETE",
            url: "http://localhost:4450/usuarios/999999999",
            headers: {
              Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
          }).then((response) => {

            cy.log(`Respuesta HTTP: ${response.status}`);

            // El rol Editor no debe poder eliminar usuarios
            expect(response.status).to.eq(403);

          });
        });
      }
    );
  });

  it("CP-SEG-07 - Verificar CORS de la API ATLAS", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:4450/roles",
      headers: {
        Origin: "https://origen-no-autorizado.example"
      },
      failOnStatusCode: false
    }).then((response) => {

      const origenPermitido =
        response.headers["access-control-allow-origin"];

      cy.log(`Access-Control-Allow-Origin: ${origenPermitido}`);

      // La API no debería permitir un origen arbitrario.
      expect(origenPermitido).not.to.eq("*");
      expect(origenPermitido)
        .not.to.eq("https://origen-no-autorizado.example");
    });
  });

  it("CP-SEG-08 - Permitir origen autorizado de ATLAS", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:4450/roles",
      headers: {
        Origin: "http://localhost:3350"
      },
      failOnStatusCode: false
    }).then((response) => {

      const origenPermitido =
        response.headers["access-control-allow-origin"];

      expect(origenPermitido)
        .to.eq("http://localhost:3350");

    });
  });


});
