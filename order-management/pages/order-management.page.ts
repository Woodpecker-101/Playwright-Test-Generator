import { Page } from '@playwright/test';

export class OrderManagementPage {
  static btnModify(page: Page) {
    return page.locator('[data-testid="btn modify"]');
  }
  static btnDetails(page: Page) {
    return page.locator('[data-testid="btn Details"]');
  }
}