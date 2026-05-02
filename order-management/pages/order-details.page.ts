import { Page } from '@playwright/test';

export class OrderDetailsPage {
  static itemQuantity(page: Page) {
    return page.locator('[data-testid="item quantity"]');
  }
  static shippingAddress(page: Page) {
    return page.locator('[data-testid="shipping address"]');
  }
}