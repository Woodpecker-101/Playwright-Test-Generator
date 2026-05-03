import { Page } from '@playwright/test';
import { OrderManagementAction } from './actions/order-management.action';
import { OrderModificationAction } from './actions/order-modification.action';
import { OrderDetailsAction } from './actions/order-details.action';
import { ShippingAddressAction } from './actions/shipping-address.action';
import { OrderCancellationAction } from './actions/order-cancellation.action';

export class OrderManagementFlow {
  readonly page: Page;
  readonly orderManagementAction: OrderManagementAction;
  readonly orderModificationAction: OrderModificationAction;
  readonly orderDetailsAction: OrderDetailsAction;
  readonly shippingAddressAction: ShippingAddressAction;
  readonly orderCancellationAction: OrderCancellationAction;

  constructor(page: Page) {
    this.page = page;
    this.orderManagementAction = new OrderManagementAction(this.page);
    this.orderModificationAction = new OrderModificationAction(this.page);
    this.orderDetailsAction = new OrderDetailsAction(this.page);
    this.shippingAddressAction = new ShippingAddressAction(this.page);
    this.orderCancellationAction = new OrderCancellationAction(this.page);
  }

  async openOrderModificationPage() {
    // click link My orders(); { /* Page or page name is undefined */ }
    // select an order(); { /* Page or page name is undefined */ }
    await this.orderManagementAction.clickButtonModify(); // Action: order management
  }

  async modifyItemQuantity() {
    await this.orderModificationAction.enterItemQuantity(); // Action: order modification
    await this.orderModificationAction.clickSaveButton(); // Action: order modification
    await this.orderModificationAction.clickConfirmButton(); // Action: order modification
  }

  async openOrderDetailsPage() {
    // click link My orders(); { /* Page or page name is undefined */ }
    // select an order(); { /* Page or page name is undefined */ }
    await this.orderManagementAction.clickButtonDetails(); // Action: order management
  }

  async changeShippingAddress() {
    await this.orderModificationAction.clickLinkChangeShippingAddress(); // Action: order modification
    await this.shippingAddressAction.enterShippingAddress(); // Action: shipping address
    await this.shippingAddressAction.clickConfirmButton(); // Action: shipping address
  }

  async cancelTheOrder() {
    await this.orderCancellationAction.clickButtonCancel(); // Action: order cancellation
    await this.orderCancellationAction.clickSaveButton(); // Action: order cancellation
    await this.orderCancellationAction.clickConfirmButton(); // Action: order cancellation
  }
}