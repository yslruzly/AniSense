# Demo data

Sample values for demo mode: an app built without `.env`, or the demo sign-in. A real account reads its data from Supabase, with one exception: while no farmer has posted a listing yet, the sample farmers and harvests stand in (`SAMPLE_MARKET`), marked as samples. The Market says so, checkout refuses them, and their numbers are never offered to call. The first real listing replaces them all.

| File | Holds |
|---|---|
| `marketplace.ts` | Five farmers (Oliver Baldeo, Christian Tiburcio, Ivan Pestanas, Marc Bawalan, Ruzly Macatula) and their 15 listings; `SAMPLE_MARKET` is the same, marked as samples, for a real account's empty Market |
| `expenses.ts` | A farmer's expenses and a buyer's past purchases |
| `orders.ts` | Two incoming orders for the demo farmer's alerts (a real account reads its own from the database) |
| `weather.ts` | Current weather and the forecast (until a weather service is connected) |

The phone numbers are invented (`+63 900 000 000x`).
