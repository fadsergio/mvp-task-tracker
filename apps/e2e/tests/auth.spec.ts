import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/Task Tracker/);
});

test('login flow', async ({ page }) => {
    await page.goto('/auth/login');

    // Check if login form is present
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

    // Fill login form (assuming these fields exist)
    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByPlaceholder('Пароль').fill('password');

    // Click login button
    await page.getByRole('button', { name: 'Войти' }).click();

    // Expect to be redirected to dashboard (or see dashboard element)
    // await expect(page).toHaveURL('/');
});
