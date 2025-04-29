import { test, expect } from '@playwright/test';

test.describe('Admin and Manager Features', () => {
  // Admin user credentials
  const adminEmail = 'admin@admin.com';
  const adminPassword = '123456';
  
  // Test user to be made manager
  const testUserEmail = 'test.user@example.com';
  const testUserPassword = '123456';

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('admin should be able to create a new manager role', async ({ page }) => {
    // Login as admin
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(adminEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to admin dashboard
    await page.getByRole('link', { name: 'Admin Dashboard' }).click();

    // Click on User Accounts tab
    await page.getByText('User Accounts').click();

    // Click Add New Manager button
    // Fill in manager details
    await page.getByRole('button', { name: 'Add New Manager' }).click();
    await page.getByRole('textbox', { name: 'Enter your name' }).click();
    await page.getByRole('textbox', { name: 'Enter your name' }).fill('test_manager');
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('test.manager@example.com');
    await page.getByRole('textbox', { name: 'Enter your password' }).click();
    await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
    await page.getByRole('textbox', { name: 'Enter your phone number' }).click();
    await page.getByRole('textbox', { name: 'Enter your phone number' }).fill('0998877660');
    await page.getByRole('button', { name: 'Add Manager' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText('successfully')).toBeVisible();
  });

  test('should login as manager successfully', async ({ page }) => {
    // Click on Sign-In link
    await page.getByRole('link', { name: 'Sign-In' }).click();
    
    // Fill in login credentials
    await page.getByRole('textbox', { name: 'Email' }).fill('greatest_manager@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    
    // Click sign in button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify successful login by checking for manager-specific elements
    await expect(page.getByRole('link', { name: 'Manager Dashboard' })).toBeVisible();
  });

  test('should access manager dashboard', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('greatest_manager@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to manager dashboard
    await page.getByRole('link', { name: 'Manager Dashboard' }).click();
    
    // Verify dashboard elements
    await expect(page.getByText('Hotel Management')).toBeVisible();
  });

  test('should view and manage hotels', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('greatest_manager@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to manager dashboard
    await page.getByRole('link', { name: 'Manager Dashboard' }).click();
    await page.getByRole('button', { name: 'View Bookings' }).first().click();
    await page.getByRole('textbox', { name: 'Search bookings by guest name' }).click();
    await expect(page.getByRole('textbox', { name: 'Search bookings by guest name' })).toBeVisible();
    await page.getByRole('button', { name: '✕' }).click();
    await page.getByRole('button', { name: 'View Available room' }).first().click();
    await expect(page.getByText('Please select a room type to')).toBeVisible();
  });

  test('should view and manage bookings', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('greatest_manager@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to manager dashboard
    await page.getByRole('link', { name: 'Manager Dashboard' }).click();
    
    // Click on Booking Management
    await page.getByRole('button', { name: 'View Bookings' }).first().click();
    await expect(page.getByRole('heading', { name: 'Bookings for' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('greatest_manager@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('link', { name: 'Sign-Out' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
}); 