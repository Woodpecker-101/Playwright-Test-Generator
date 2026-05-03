import { Page } from '@playwright/test';
import { OrderDetailsPage } from '../pages/order-details.page';

export class OrderDetailsAction {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async validateItemQuantity() {
    await OrderDetailsPage.itemQuantity(this.page).click();
  }

  async validateShippingAddress() {
    await OrderDetailsPage.shippingAddress(this.page).click();
  }
}