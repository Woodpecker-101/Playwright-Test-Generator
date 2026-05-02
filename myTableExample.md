| Feature Name     | Scenario Name   | Test Name               | Flow Name                    | Step Name                          | Page Name          | Target                       |
|------------------|-----------------|-------------------------|------------------------------|------------------------------------|--------------------|------------------------------|
| Order management | Modify an order | Change item quantity    | Open order modification page | click link My orders               |                    |                              |
|                  |                 |                         | Open order modification page | select an order                    |                    |                              |
|                  |                 |                         | Open order modification page | click button Modify                | order management   | btn modify                   |
|                  |                 |                         | modify item quantity         | enter item quantity                | order modification | item quantity                |
|                  |                 |                         | modify item quantity         | click Save button                  | order modification | btn Save                     |
|                  |                 |                         | modify item quantity         | click Confirm button               | order modification | btn Confirm                  |
|                  |                 |                         | Open order details page      | click link My orders               |                    |                              |
|                  |                 |                         | Open order details page      | select an order                    |                    |                              |
|                  |                 |                         | Open order details page      | click button Details               | order management   | btn Details                  |
|                  |                 |                         |                              | validate item quantity             | order details      | item quantity                |
|                  |                 | Change shipping address | Open order modification page | click link My orders               |                    |                              |
|                  |                 |                         | Open order modification page | select an order                    |                    |                              |
|                  |                 |                         | Open order modification page | click button Modify                | order management   | btn modify                   |
|                  |                 |                         | Change shipping address      | click link Change shipping address | order modification | link Change shipping address |
|                  |                 |                         | Change shipping address      | enter shipping address             | shipping address   | field shipping address       |
|                  |                 |                         | Change shipping address      | click Confirm button               | shipping address   | btn Confirm                  |
|                  |                 |                         | Open order details page      | click link My orders               |                    |                              |
|                  |                 |                         | Open order details page      | select an order                    |                    |                              |
|                  |                 |                         | Open order details page      | click button Details               | order management   | btn Details                  |
|                  |                 |                         |                              | validate shipping address          | order details      | shipping address             |
| Order management | Cancel an order | Cancel order sucessfully| Open order modification page | click link My orders               |                    |                              |
|                  |                 |                         | Open order modification page | select an order                    |                    |                              |
|                  |                 |                         | Open order modification page | click button Modify                | order management   | btn modify                   |
|                  |                 |                         | cancel the order             | click button Cancel                | order cancellation | btn Cancel                   |
|                  |                 |                         | cancel the order             | click Save button                  | order cancellation | btn Save                     |
|                  |                 |                         | cancel the order             | click Confirm button               | order cancellation | btn Confirm                  |
