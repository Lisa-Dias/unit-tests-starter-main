# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: produtos.spec.js >> remove um produto
- Location: e2e\produtos.spec.js:31:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 204
Received: 404
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.beforeEach(async ({ page, request }) => {
  4  |   const resposta = await request.post("http://localhost:3000/_reset");
> 5  |   expect(resposta.status()).toBe(204);
     |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  6  |   await page.goto("/");
  7  | });
  8  | 
  9  | test("lista os produtos iniciais", async ({ page }) => {
  10 |   await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  11 |   await expect(page.getByRole("row")).toHaveCount(4);
  12 |   await expect(page.getByRole("cell", { name: "Coxinha" })).toBeVisible;
  13 | });
  14 | 
  15 | test("cadastra um novo produto", async ({ page }) => {
  16 |   await page.getByLabel("Nome").fill("Kibe");
  17 |   await page.getByLabel("Preco").fill("7");
  18 |   await page.getByRole("button", { name: "Cadastrar" }).click();
  19 | 
  20 |   const linha = page.getByRole("row", { name: /Kibe/ });
  21 |   await expect(linha).toBeVisible();
  22 |   await expect(linha).toContainText("R$7,00");
  23 | });
  24 | 
  25 | test("mostra o erro sem cadastrar sem preenchimento", async ({ page }) => {
  26 |     await page.getByRole("button", { name: "Cadastrar" }).click();
  27 |     await expect(page.getByText("Nome e preço são obrigatórios")).toBeVisible();
  28 | 
  29 | });
  30 | 
  31 | test("remove um produto", async ({ page }) => {
  32 |     const linha = page.getByRole("row", { name: /Pastel/ });
  33 |     await linha.getByRole("button", { name: "Remover" }).click();
  34 |     await expect(linha).toHaveCount(0);
  35 | });
  36 | 
  37 | 
```