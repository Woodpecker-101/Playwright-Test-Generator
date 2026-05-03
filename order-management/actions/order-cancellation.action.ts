import { Page } from '@playwright/test';
import { OrderCancellationPage } from '../pages/order-cancellation.page';

export class OrderCancellationAction {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async clickButtonCancel() {
    await OrderCancellationPage.btnCancel(this.page).click();
  }

  async clickSaveButton() {
    await OrderCancellationPage.btnSave(this.page).click();
  }

  async clickConfirmButton() {
    await OrderCancellationPage.btnConfirm(this.page).click();
  }
}