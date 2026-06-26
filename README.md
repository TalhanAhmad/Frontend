# Soket Chat Frontend

## files


Create a `.env` file from `.env.example` for local development, and set the same variables in Vercel for production:

```env
VITE_API_URL=https://backend-git-main-talha-ahmad.vercel.app/api
VITE_SOCKET_URL=https://backend-git-main-talha-ahmad.vercel.app
```

If `VITE_API_URL` is missing in production, login and signup requests will try the local development backend and fail in the browser.
