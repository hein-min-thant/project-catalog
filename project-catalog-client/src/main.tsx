import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";

import "@/styles/globals.css";
import { NotificationProvider } from "./hooks/useNotifications.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <Provider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Provider>
      </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>
);
