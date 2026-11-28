# 2Learn - Front End (M01141362)

CST3144 Full Stack Development coursework. Vue.js app for booking after-school lessons.

## Links

- Vue.js App - GitHub repo: https://github.com/ykay101/learnhub-frontend-M01141362
- Vue.js App - GitHub Pages: https://ykay101.github.io/learnhub-frontend-M01141362/
- Express.js App - GitHub repo: https://github.com/ykay101/learnhub-backend-M01141362
- Express.js App - all lessons (render.com): https://m01141362-backend.onrender.com/lessons

## Built with

- Vue 3.5 (from CDN)
- Tailwind CSS 4 (browser build from CDN)
- Font Awesome 4.7 and Google Fonts (Fraunces, Inter)
- Stripe.js (card payments in test mode)
- fetch for all requests to the back end (including reading the planner's streamed steps with `response.body.getReader()`)
- the browser's speech recognition for voice input in the planner

## Files

| File | What it does |
| ---- | ------------ |
| index.html | page layout and the root Vue template |
| app.js | the Vue app: lessons, sorting, search, teacher filter, cart and checkout |
| api.js | server address and the fetch helpers |
| components/NavBar.js | top bar with the cart button |
| components/LessonFilters.js | search box, teacher filter and sort controls |
| components/LessonCard.js | one lesson with its Add to Cart button |
| components/CartPage.js | cart items and the checkout form |
| components/CardForm.js | Stripe card form shown in the checkout |
| components/AuthModal.js | sign in and create account |
| components/AccountMenu.js | the signed-in menu in the top bar |
| components/FamilyPage.js | phone, home area and children |
| components/BookingsPage.js | my past bookings |
| components/PlannerPanel.js | the AI planner: request box, voice input, live steps and results |
| components/WeekCalendar.js | the family week calendar and budget bar |
| payment.js | sets up Stripe and pays for the cart |
| session.js | keeps the sign-in token in the browser |
| money.js | formats prices |
| style.css | v-cloak and the page/card transitions |

## Marked features

The lessons list, sorting, search, teacher filter, Add to Cart, cart page and checkout are all in `app.js`. `getLessons()` fetches the lessons with GET, and `checkout()` saves the order with POST and then updates the spaces with PUT. Every request uses `fetch`, which returns a promise (`async`/`await` is written on top of promises).

## Running locally

Start the back end first (it runs on port 5000), then serve this folder, e.g. with VS Code Live Preview or:

```
python3 -m http.server 5500
```

and open http://localhost:5500. When the page is opened on localhost it uses the local back end, otherwise it uses the render.com server.
