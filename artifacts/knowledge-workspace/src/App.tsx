import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import SearchPage from "@/pages/search";
import GapsPage from "@/pages/gaps";
import FaqPage from "@/pages/faq";
import OnboardingPage from "@/pages/onboarding";
import PromptsPage from "@/pages/prompts";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/search" />
      </Route>
      <Route path="/search" component={SearchPage} />
      <Route path="/gaps" component={GapsPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/prompts" component={PromptsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
