const ClienteService = require("../../services/ClienteService");

// Teste unitario: o service e testado em isolamento total.
// O repository e substituido por um mock (jest.fn()), assim testamos so a
// logica do service, sem depender de dados reais.
//
// Abaixo ha 1 teste pronto (listar) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-02-CLIENTES.md.

describe("ClienteService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ClienteService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const clientes = [{ id: 1, nome: "Ana Souza", email: "ana@email.com" }];
      mockRepository.findAll.mockReturnValue(clientes);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(clientes);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o cliente encontrado", () => {
      const cliente = { id: 1, nome: "Ana Souza", email: "ana@email.com" };
      mockRepository.findById.mockReturnValue(cliente);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(cliente);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(999)).toThrow("Cliente nao encontrado");
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o cliente criado", () => {
      const dados = { nome: "Carla Dias", email: "carla@email.com" };
      const cliente = { id: 3, ...dados };
      mockRepository.create.mockReturnValue(cliente);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(cliente);
    });

    test("propaga o erro quando nome ou email estiverem faltando", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Nome e email sao obrigatorios");
      });

      expect(() => service.criar({ nome: "Carla" })).toThrow(
        "Nome e email sao obrigatorios",
      );
      expect(() => service.criar({ email: "carla@email.com" })).toThrow(
        "Nome e email sao obrigatorios",
      );
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      const dados = { nome: "Ana Souza", email: "ana@email.com" };
      mockRepository.create.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.criar(dados)).toThrow("Email ja cadastrado");
    });
  });

  describe("atualizar", () => {
    test("chama repository.findById e repository.update quando o cliente existe", () => {
      const cliente = { id: 2, nome: "Bruno Lima", email: "bruno@email.com" };
      const dados = { nome: "Bruno Lima Silva", email: "bruno@email.com" };
      const atualizado = { ...cliente, ...dados };
      mockRepository.findById.mockReturnValue(cliente);
      mockRepository.update.mockReturnValue(atualizado);

      const resultado = service.atualizar(2, dados);

      expect(mockRepository.findById).toHaveBeenCalledWith(2);
      expect(mockRepository.update).toHaveBeenCalledWith(2, dados);
      expect(resultado).toEqual(atualizado);
    });

    test("lanca erro 'Cliente nao encontrado' sem chamar repository.update quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizar(999, { nome: "X", email: "x@email.com" })).toThrow(
        "Cliente nao encontrado",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      const cliente = { id: 2, nome: "Bruno Lima", email: "bruno@email.com" };
      mockRepository.findById.mockReturnValue(cliente);
      mockRepository.update.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() =>
        service.atualizar(2, { nome: "Bruno Lima", email: "ana@email.com" }),
      ).toThrow("Email ja cadastrado");
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o cliente existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(2);

      expect(mockRepository.delete).toHaveBeenCalledWith(2);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(999)).toThrow("Cliente nao encontrado");
    });
  });
});
