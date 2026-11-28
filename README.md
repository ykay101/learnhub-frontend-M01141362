# 2Learn - Front End (M01141362)

Vue.js app for booking after-school lessons.

## Links

- Vue.js App - GitHub repo: https://github.com/ykay101/learnhub-frontend-M01141362
- Vue.js App - GitHub Pages: https://ykay101.github.io/learnhub-frontend-M01141362/
- Express.js App - GitHub repo: https://github.com/ykay101/learnhub-backend-M01141362
- Express.js App - all lessons (render.com): https://m01141362-backend.onrender.com/lessons

## Built with

Vue 3 and Tailwind CSS from CDN, Font Awesome, Stripe.js, and `fetch` for every request to the back end.

## Files

| File | What it does |
| ---- | ------------ |
| index.html | page layout and the root Vue template |
| app.js | the Vue app: lessons, sorting, search, cart and checkout |
| api.js | server address and fetch helpers |
| payment.js | Stripe card payments |
| session.js | keeps the sign-in token |
| components/ | the Vue components (lesson card, cart, sign in, planner, etc.) |
| style.css | animations and transitions |

`getLessons()` in `app.js` loads the lessons with GET, and `checkout()` saves the order with POST and then updates the spaces with PUT.

## Running locally

Start the back end first (port 5000), then serve this folder:

```
python3 -m http.server 5500
```

and open http://localhost:5500. On localhost it uses the local back end, otherwise the render.com server.
