// import { test, expect } from "@playwright/test";

// test.beforeEach(async ({ page, request }) => {
//   const resposta = await request.post("http://localhost:3000/__reset");
//   expect(resposta.status()).toBe(204);
//   await page.goto("/");
// });

// test("lista os produtos iniciais", async ({ page }) => {
//   await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
//   await expect(page.getByRole("row")).toHaveCount(4);
//   await expect(page.getByRole("cell", { name: "Coxinha" })).toBeVisible;
// });

// test("cadastra um novo produto", async ({ page }) => {
//   await page.getByLabel("Nome").fill("Kibe");
//   await page.getByLabel("Preco").fill("7");
//   await page.getByRole("button", { name: "Cadastrar" }).click();

//   const linha = page.getByRole("row", { name: /Kibe/ });
//   await expect(linha).toBeVisible();
//   await expect(linha).toContainText("R$7,00");
// });

// test("mostra o erro sem cadastrar sem preenchimento", async ({ page }) => {
//     await page.getByRole("button", { name: "Cadastrar" }).click();
//     await expect(page.getByText("Nome e preço são obrigatórios")).toBeVisible();

// });

// test("remove um produto", async ({ page }) => {
//     const linha = page.getByRole("row", { name: /Pastel/ });
//     await linha.getByRole("button", { name: "Remover" }).click();
//     await expect(linha).toHaveCount(0);
// });

import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();

  // a tela depende de 3 fontes de dados: espera clientes e produtos carregarem
  await expect(page.getByLabel("Cliente", { exact: true })).toContainText(
    "Ana Souza"
  );
  await expect(page.getByLabel("Produto", { exact: true })).toContainText(
    "Coxinha"
  );
});

// Funções auxiliares
async function adicionarItem(page, produto, quantidade) {
  await page.getByLabel("Produto", { exact: true }).selectOption({ label: produto });
  if (quantidade !== undefined) {
    await page.getByLabel("Quantidade").fill(String(quantidade));
  }
  await page.getByRole("button", { name: "Adicionar item" }).click();
}

// P1
test("lista os pedidos iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  const linha = page.getByRole("row", { name: /Ana Souza/ });
  await expect(linha).toHaveCount(1);
  await expect(linha.getByRole("cell", { name: "1", exact: true })).toBeVisible();
  await expect(linha.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(linha).toContainText("2x Coxinha");
  await expect(linha.getByRole("cell", { name: /R\$\s*10,00/ })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});

// P2
test("monta um pedido com um item", async ({ page }) => {
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Bruno Lima" });
  await adicionarItem(page, "Pastel");

  // item aparece na lista antes de criar o pedido
  await expect(page.getByText("1x Pastel")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("1x Pastel");
  await expect(linha).toContainText(/R\$\s*8,00/);
  await expect(linha.getByRole("combobox")).toHaveValue("pendente");

  // formulário limpo: lista de itens vazia e cliente desmarcado
  await expect(page.getByLabel("Cliente", { exact: true })).toHaveValue("");
  await expect(page.getByText("1x Pastel")).toHaveCount(1); // só na tabela
});

// P3
test("monta um pedido com vários itens e quantidades", async ({ page }) => {
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Ana Souza" });
  await adicionarItem(page, "Coxinha", 3);
  await adicionarItem(page, "Empada", 1);
  await page.getByRole("button", { name: "Criar pedido" }).click();

  // #1 também é da Ana, então pegamos a linha do pedido novo (#2).
  // A tabela exibe o identificador como "2", sem o caractere "#".
  const linha = page.getByRole("row", { name: /^2\s/ });
  await expect(linha).toContainText("3x Coxinha");
  await expect(linha).toContainText("1x Empada");
  // total calculado pela API: 3 x 5 + 1 x 6 = 21 (conforme o enunciado)
  await expect(linha).toContainText(/R\$\s*21,00/);
});

// P4
test("quantidade volta a 1 após adicionar item", async ({ page }) => {
  await page.getByLabel("Produto", { exact: true }).selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("5");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
});

// P5
test("não cria pedido sem cliente", async ({ page }) => {
  await adicionarItem(page, "Coxinha");
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(2); // cabeçalho + #1
});

// P6
test("não cria pedido sem itens", async ({ page }) => {
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Ana Souza" });
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Pedido deve ter ao menos um item")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(2);
});

// P7
test("altera o status de um pedido", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await status.selectOption("pago");

  await expect(status).toHaveValue("pago");
});

// P8
test("pedido cancelado não pode ser alterado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");

  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pago");
  await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
  // o valor exibido deve ser o do servidor
  await expect(status).toHaveValue("cancelado");
});

// P9
test("remove um pedido", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Ana Souza/ });
  await linha.getByRole("button", { name: "Remover" }).click();

  await expect(linha).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(1); // só o cabeçalho
});

// P10 (desafio)
test("ciclo completo do pedido", async ({ page }) => {
  // criar pedido: Bruno Lima, 2x Empada
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Bruno Lima" });
  await adicionarItem(page, "Empada", 2);
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linha).toContainText("2x Empada");
  await expect(linha).toContainText(/R\$\s*12,00/);
  await expect(page.getByRole("row")).toHaveCount(3);

  const status = page.getByLabel("Status do pedido 2");
  await expect(status).toHaveValue("pendente");

  // pago
  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");

  // cancelar
  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  // tentar voltar para pendente: erro e continua cancelado
  await status.selectOption("pendente");
  await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
  await expect(status).toHaveValue("cancelado");

  // remover
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(linha).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2); // cabeçalho + #1
});