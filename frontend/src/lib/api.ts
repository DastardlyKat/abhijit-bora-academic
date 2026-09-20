// Set VITE_API_BASE_URL in your .env (frontend root) for prod, e.g.
//   VITE_API_BASE_URL=https://api.abhijitbora.com
// Falls back to the local FastAPI dev server if unset.
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
