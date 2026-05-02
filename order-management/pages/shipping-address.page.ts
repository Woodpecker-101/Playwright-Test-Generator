import { Page } from '@playwright/test';

export class ShippingAddressPage {
  static fieldShippingAddress(page: Page) {
    return page.locator('[data-testid="field shipping address"]');
  }
  static btnConfirm(page: Page) {
    return page.locator('[data-testid="btn Confirm"]');
  }
}