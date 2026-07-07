# Improvements

## Homepage

1. Title

2. Description

3. "Get Started"/"Plans & Pricing"

4. Flagship features

5. What you get

6. Why Teams Trust Us?

7. Basic Setup Tutorial

8. Plans & Pricing (this section has a More Button, that when you click it shows you the full list of plans & pricing, but you have to be signed in)

   - Prices

   - Bundle Plans(explained later, add 6 of them)

   - More Button

9. Ready to join section

10. Footer

## Dashboard

- if you don't have any servers. it should prompt you to book a server. if you click "Maybe Later" you can go back to the homepage only
- Once in the dashboard, you can go back to the home page by interacting with a nav element
- If you click on Book a server it'll take you through 3 Steps & you can click a back button to go back to the previous step.
  1. You enter the name of the server & click next

  2. You choose Basic plan or Pro plan & enter the lease duration

  3. You Choose a bundle plan or Choose the Custom Option. And it should show the price here

- After Payment, You should be able to see your server in the list of servers you booked

- After you click on that server. the sidebar appears & now you have the control, you can of course collapse the side-bar or expand it with a side bar icon at the top

- Side-Bar Options

  1. Overview(default)

  2. Settings

  3. Security

  4. Plan & Usage

  5. User Management

  6. Activity Logs

- Settings

  - We'll add more later
  - Change Name
  - Delete Server

- Plan & Usage (Try to use progress animations & fields)
  - Display the Storage that's left Left
  - Display Chats Consumed
  - Time left till you need to renew the lease duration, or select a more higher time limit
  - You can upgrade your plan storage or chat capacity here
  - After the time of lease is done. for basic plans: 3 days, for pro plans: 7 days. after these days are finished. your server is wiped & nuked off the DB, it's gone. in these days, you cannot access your server at-all until you renew your time limit

- For others, Try to improvise a little until i figure them out

## Useful Info

- a bundle plan(should be displayed as cards with their features) is simply, a pre-built template plan that is cheaper than the same plan via custom option. Apply a 10% discount or something should have 6 pro bundle plan, 6 basic bundle plan, bundle plans should have proper storage & proper chat capacity(they should all match [e.g basic, 10 MG, 2 Chats ])

- lease duration isn't bundled with bundle plan(you select it independently)

- a custom plan allows you to specify each option unlike the bundle plan

- plans & pricing button: takes you to the plans & pricing section, Get Started button: prompts you to sign in, Replace "Get Started" button with "Dashboard" button if already signed-in + booked a server
