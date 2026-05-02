import { Page } from '@playwright/test';
import { ShippingAddressPage } from '../pages/shipping-address.page';

export class ShippingAddressAction {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async enterShippingAddress() {
    await ShippingAddressPage.fieldShippingAddress(this.page).click();
  }

  async clickConfirmButton() {
    await ShippingAddressPage.btnConfirm(this.page).click();
  }
}