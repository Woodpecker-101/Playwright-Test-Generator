import { test } from '@playwright/test';
import { OrderManagementFlow } from '../order-management.flow';

test.describe('Modify an order', () => {
  let flow: OrderManagementFlow;

  test.beforeAll(async () => {
    // Add any setup code here if needed
  });

  test.beforeEach(async ({ page }) => {
    flow = new OrderManagementFlow(page);
    // Add any setup code here if needed
  });

  test('Change item quantity', async ({ page }) => {
    await flow.openOrderModificationPage();
    await flow.modifyItemQuantity();
    await flow.openOrderDetailsPage();
    await flow.orderDetailsAction.validateItemQuantity(); // Action: order details
  });

  test('Change shipping address', async ({ page }) => {
    await flow.openOrderModificationPage();
    await flow.changeShippingAddress();
    await flow.openOrderDetailsPage();
    await flow.orderDetailsAction.validateShippingAddress(); // Action: order details
  });

  test.afterEach(async () => {
    // Add any teardown code here if needed
  });

  test.afterAll(async () => {
    // Add any teardown code here if needed
  });
});