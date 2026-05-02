import { Page } from '@playwright/test';
import { OrderManagementPage } from '../pages/order-management.page';

export class OrderManagementAction {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async clickButtonModify() {
    await OrderManagementPage.btnModify(this.page).click();
  }

  async clickButtonDetails() {
    await OrderManagementPage.btnDetails(this.page).click();
  }
}