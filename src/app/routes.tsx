import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { SuccessPage } from "./pages/SuccessPage";
import { LoginPage } from "./pages/LoginPage";
import { ProviderPage } from "./pages/ProviderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "catalog", Component: CatalogPage },
      { path: "login", Component: LoginPage },
      { path: "profile", Component: ProviderPage },
      { path: "success", Component: SuccessPage },
    ],
  },
]);
