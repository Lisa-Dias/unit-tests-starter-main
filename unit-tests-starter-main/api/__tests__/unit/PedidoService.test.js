const PedidoService = require("../../services/PedidoService");

// Teste unitario: o service e testado em isolamento total.
// O repository e substituido por um mock (jest.fn()), assim testamos so a
// logica do service, sem depender de dados reais.
//
// Abaixo ha 1 teste pronto (listar) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-03-PEDIDOS.md.

describe("PedidoService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    service = new PedidoService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const pedidos = [
        {
          id: 1,
          cliente: "Ana Souza",
          itens: [],
          status: "pendente",
          total: 0,
        },
      ];
      mockRepository.findAll.mockReturnValue(pedidos);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(pedidos);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o pedido encontrado", () => {
      const pedido = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };
      mockRepository.findById.mockReturnValue(pedido);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(pedido);
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retorna null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(999)).toThrow("Pedido nao encontrado");
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o pedido criado com o total calculado", () => {
      const dados = {
        cliente: "Carla Dias",
        itens: [
          { nome: "Pastel", precoUnitario: 6, quantidade: 2 },
          { nome: "Refrigerante", precoUnitario: 4, quantidade: 3 },
        ],
      };
      const pedido = {
        id: 2,
        cliente: "Carla Dias",
        itens: dados.itens,
        status: "pendente",
        total: 24,
      };
      mockRepository.create.mockReturnValue(pedido);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(pedido);
    });

    test("propaga o erro quando o cliente estiver faltando", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Cliente e obrigatorio");
      });

      expect(() => service.criar({ itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }] })).toThrow(
        "Cliente e obrigatorio",
      );
    });

    test("propaga o erro quando a lista de itens estiver vazia", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Pedido deve ter ao menos um item");
      });

      expect(() => service.criar({ cliente: "Ana Souza", itens: [] })).toThrow(
        "Pedido deve ter ao menos um item",
      );
    });

    test("propaga o erro quando algum item tiver preco ou quantidade invalidos", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Itens devem ter nome, preco e quantidade validos");
      });

      expect(() =>
        service.criar({
          cliente: "Ana Souza",
          itens: [{ nome: "Coxinha", precoUnitario: 0, quantidade: 2 }],
        }),
      ).toThrow("Itens devem ter nome, preco e quantidade validos");
    });
  });

  describe("atualizarStatus", () => {
    test("chama repository.findById e repository.updateStatus quando o pedido existe", () => {
      const pedido = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };
      const atualizado = { ...pedido, status: "pago" };
      mockRepository.findById.mockReturnValue(pedido);
      mockRepository.updateStatus.mockReturnValue(atualizado);

      const resultado = service.atualizarStatus(1, "pago");

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, "pago");
      expect(resultado).toEqual(atualizado);
    });

    test("lanca erro 'Pedido nao encontrado' sem chamar repository.updateStatus quando o pedido nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizarStatus(999, "pago")).toThrow(
        "Pedido nao encontrado",
      );
      expect(mockRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo status for invalido", () => {
      const pedido = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "pendente",
        total: 10,
      };
      mockRepository.findById.mockReturnValue(pedido);
      mockRepository.updateStatus.mockImplementation(() => {
        throw new Error("Status invalido");
      });

      expect(() => service.atualizarStatus(1, "entregue")).toThrow(
        "Status invalido",
      );
    });

    test("propaga o erro quando o pedido ja estiver cancelado", () => {
      const pedido = {
        id: 1,
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }],
        status: "cancelado",
        total: 10,
      };
      mockRepository.findById.mockReturnValue(pedido);
      mockRepository.updateStatus.mockImplementation(() => {
        throw new Error("Pedido cancelado nao pode ser alterado");
      });

      expect(() => service.atualizarStatus(1, "pago")).toThrow(
        "Pedido cancelado nao pode ser alterado",
      );
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o pedido existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retorna false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(999)).toThrow("Pedido nao encontrado");
    });
  });
});
