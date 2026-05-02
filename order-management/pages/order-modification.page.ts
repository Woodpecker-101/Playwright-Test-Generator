import { Page } from '@playwright/test';

export class OrderModificationPage {
  static itemQuantity(page: Page) {
    return page.locator('[data-testid="item quantity"]');
  }
  static btnSave(page: Page) {
    return page.locator('[data-testid="btn Save"]');
  }
  static btnConfirm(page: Page) {
    return page.locator('[data-testid="btn Confirm"]');
  }
  static linkChangeShippingAddress(page: Page) {
    return page.locator('[data-testid="link Change shipping address"]');
  }
}