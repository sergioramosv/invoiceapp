import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load and show hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Facturación profesional')
    await expect(page.locator('text=Empezar gratis').first()).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    // Check nav links exist
    await expect(page.locator('nav >> text=Iniciar sesión').first()).toBeVisible()
  })

  test('should navigate to signup', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Empezar gratis >> nth=0')
    await expect(page).toHaveURL(/signup/)
  })

  test('should show pricing section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=29€').first()).toBeVisible()
  })

  test('should show FAQ section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Preguntas frecuentes')).toBeVisible()
  })

  test('should toggle FAQ accordion', async ({ page }) => {
    await page.goto('/')
    const faqButton = page.locator('text=Es realmente gratis').first()
    await faqButton.click()
    await expect(page.locator('text=puedes crear facturas gratis').first()).toBeVisible()
  })
})
