import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { SuccessPage } from "./pages/SuccessPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "catalog", Component: CatalogPage },
      { path: "success", Component: SuccessPage },
    ],
  },
]);
