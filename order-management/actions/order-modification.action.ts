import { Page } from '@playwright/test';
import { OrderModificationPage } from '../pages/order-modification.page';

export class OrderModificationAction {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async enterItemQuantity() {
    await OrderModificationPage.itemQuantity(this.page).click();
  }

  async clickSaveButton() {
    await OrderModificationPage.btnSave(this.page).click();
  }

  async clickConfirmButton() {
    await OrderModificationPage.btnConfirm(this.page).click();
  }

  async clickLinkChangeShippingAddress() {
    await OrderModificationPage.linkChangeShippingAddress(this.page).click();
  }
}