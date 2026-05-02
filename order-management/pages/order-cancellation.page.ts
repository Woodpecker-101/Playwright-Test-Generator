import { Page } from '@playwright/test';

export class OrderCancellationPage {
  static btnCancel(page: Page) {
    return page.locator('[data-testid="btn Cancel"]');
  }
  static btnSave(page: Page) {
    return page.locator('[data-testid="btn Save"]');
  }
  static btnConfirm(page: Page) {
    return page.locator('[data-testid="btn Confirm"]');
  }
}