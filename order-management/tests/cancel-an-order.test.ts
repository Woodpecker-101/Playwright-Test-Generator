import { test } from '@playwright/test';
import { OrderManagementFlow } from '../order-management.flow';

test.describe('Cancel an order', () => {
  let flow: OrderManagementFlow;

  test.beforeAll(async () => {
    // Add any setup code here if needed
  });

  test.beforeEach(async ({ page }) => {
    flow = new OrderManagementFlow(page);
    // Add any setup code here if needed
  });

  test('Cancel order sucessfully', async ({ page }) => {
    await flow.openOrderModificationPage();
    await flow.cancelTheOrder();
  });

  test.afterEach(async () => {
    // Add any teardown code here if needed
  });

  test.afterAll(async () => {
    // Add any teardown code here if needed
  });
});