import { test, expect } from '@playwright/test'

test.describe('Authentication Pages', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar sesion')
    await expect(page.locator('text=Continuar con Google')).toBeVisible()
  })

  test('should show signup page', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('h1')).toContainText('Crear cuenta')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/signup')
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'test@test.com')
    await page.fill('input[id="password"]', '123')
    await page.click('button[type="submit"]')
    // HTML5 validation or custom error
    await expect(page.locator('text=8 caracteres').first()).toBeVisible()
  })

  test('should link between login and signup', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Crear cuenta')
    await expect(page).toHaveURL(/signup/)

    await page.click('text=Iniciar sesion')
    await expect(page).toHaveURL(/login/)
  })

  test('should redirect /workspace to /login without session', async ({ page }) => {
    await page.goto('/workspace')
    await expect(page).toHaveURL(/login/)
  })
})
