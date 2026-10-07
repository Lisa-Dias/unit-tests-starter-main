const request = require("supertest");
const createApp = require("../../app");

describe("API /produtos - testes de integração", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /produtos", () => {
    test("Retorna 200 e um array com os produtos iniciais", async () => {
      const res = await request(app).get("/produtos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Ajuste feito para refletir os dados iniciais reais do repositório:
      // o estado inicial contém 3 produtos (Coxinha, Pastel e Empada).
      expect(res.body.length).toBe(3);
    });

    // teste GET/produtos/:id
  });
});
