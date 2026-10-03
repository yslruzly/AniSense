# Demo data

Sample values for demo mode: an app built without `.env`, or the demo sign-in. A real account never sees them; it reads its data from Supabase.

| File | Holds |
|---|---|
| `marketplace.ts` | Listings and the farmers who post them |
| `expenses.ts` | A farmer's expenses and a buyer's past purchases |
| `orders.ts` | Two incoming orders for the farmer's alerts (a mockup until orders are read from the database) |
| `weather.ts` | Current weather and the forecast (until a weather service is connected) |

The names and phone numbers are invented.
