import { test, expect } from '@playwright/test'

test.describe('Legal Pages', () => {
  test('should load legal notice', async ({ page }) => {
    await page.goto('/legal-notice')
    await expect(page.locator('h1')).toContainText('Aviso Legal')
  })

  test('should load terms of service', async ({ page }) => {
    await page.goto('/tos')
    await expect(page.locator('h1')).toContainText('Términos')
  })

  test('should load privacy policy', async ({ page }) => {
    await page.goto('/privacy-policy')
    await expect(page.locator('h1')).toContainText('Privacidad')
  })
})
