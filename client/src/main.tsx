import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { PublicSiteChrome } from "./components/PublicSiteChrome";
import Login from "./pages/Login";
import "./index.css";
import "./editorial-2027.css";
import "./editorial-2027-refinements.css";
import "./public-2027.css";
import "./public-pages-2027.css";
import "./home-2027-complete.css";
import "./gallery-folders-2027.css";
import "./sponsor-sprite-2027.css";
import "./login-2027.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname === "/login") return;
  window.location.href = getLoginUrl(currentPath);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const PUBLIC_CHROME_PREFIXES = [
  "/about", "/press", "/sponsors", "/contact", "/legal/", "/mentions-legales",
  "/ranking", "/gallery", "/candidates", "/candidat/", "/public", "/article/",
  "/inscription-candidat", "/inscription-merci", "/onboarding/candidate/", "/invite/",
  "/invitation/", "/verify/", "/profile/edit/",
];

function RootExperience() {
  const path = window.location.pathname;
  if (path === "/login") return <Login />;

  const usePublicChrome = path !== "/" && PUBLIC_CHROME_PREFIXES.some(prefix => path.startsWith(prefix));
  return usePublicChrome ? <PublicSiteChrome><App /></PublicSiteChrome> : <App />;
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <RootExperience />
    </QueryClientProvider>
  </trpc.Provider>
);
