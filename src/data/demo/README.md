# Demo data

Sample values for demo mode: an app built without `.env`, or the demo sign-in. A real account reads its data from Supabase, with four exceptions, each marked as samples on screen and replaced by the first real one:

- while no farmer has posted a listing yet, the sample farmers and harvests stand in (`SAMPLE_MARKET`). The Market says so, checkout refuses them, and their numbers are never offered to call;
- while a buyer has no orders, sample orders stand in on Home and the Orders page (`SAMPLE_PURCHASES`), with nothing to pay or rate;
- while a farmer has posted nothing, three sample listings stand in on Home's Your harvest (`SAMPLE_HARVEST`), only to read. Not while the Market could not be loaded at all: then it says nothing is on sale.
- while a farmer has recorded no expenses, nine sample expenses from this month and the two before stand in on the Expenses page (`SAMPLE_EXPENSES`), filed under the farmer's own crops and only to read. Home never counts them as money spent.

| File | Holds |
|---|---|
| `marketplace.ts` | Five farmers (Juan Dela Cruz, Maria Dela Cruz, Jose Reyes, Pedro Cruz, Manuel Garcia) and their 15 listings; `SAMPLE_MARKET` is the same, marked as samples, for a real account's empty Market; `SAMPLE_HARVEST`, a farmer's own three (Special Rice above the market price, Red Onion below it, Regular Calamansi at it) |
| `expenses.ts` | A farmer's expenses and a buyer's past purchases; `SAMPLE_PURCHASES` is the same purchases, marked as samples; `SAMPLE_EXPENSES`, nine expenses dated from today, for a real farmer who has recorded none |
| `orders.ts` | Two incoming orders for the demo farmer's alerts (a real account reads its own from the database) |

The phone numbers are invented (`+63 900 000 000x`).
