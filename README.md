# Miseria Ecommerce V9

React + Vite frontend with an Express/SQLite ecommerce backend.

## Highlights
- Public homepage and product browsing
- Four-flavour Miseria Crunch visual stage using the supplied flavour photography, switching automatically every ~2.2 seconds
- Larger scattered flavour typography and peanut-mark decorative elements around the central image
- Dedicated `/starter-pack` page using the supplied exploding four-pack image
- Starter Pack is purchasable at ₹120 and remains integrated with the authenticated cart
- Individual product detail routes
- Seamless login/register sliding presentation from the previous build
- Cart quantity deduplication and persistence per account
- Checkout with delivery details and cash on delivery
- Orders and order history backed by SQLite
- Gmail SMTP development email support for welcome and order emails
- Instagram and Facebook links
- Netlify SPA fallback via `public/_redirects`
- Responsive layouts and reduced-motion support

## Local setup
1. Run `npm install` in the project root.
2. Create `server/.env` from `server/.env.example`.
3. Set your JWT secret and Gmail SMTP values.
4. Run `npm run server` for the API.
5. Run `npm run dev` for the frontend.

Example SMTP configuration:

```env
MAIL_PROVIDER=gmail
SMTP_USER=yourgmail@gmail.com
SMTP_APP_PASSWORD=your-16-character-gmail-app-password
MAIL_FROM=Miseria <yourgmail@gmail.com>
```

Keep the real `server/.env` out of version control.

## Routes
- `/`
- `/products`
- `/starter-pack`
- `/products/:slug`
- `/login`
- `/register`
- `/account`
- `/checkout`
