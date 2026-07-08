import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-6">
      <Helmet>
        <title>Not found | ERP System</title>
        <meta
          name="description"
          content="The route you have came here is a not found route"
        />
      </Helmet>
      <div className="relative max-w-lg w-full text-center">
        {/* Glow Background */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-linear-to-r from-primary via-purple-500 to-blue-500 rounded-full" />

        <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-xl p-10">
          {/* Error Code */}
          <h1 className="text-8xl font-bold tracking-tight bg-linear-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="mt-4 text-3xl font-semibold">Page Not Found</h2>

          <p className="mt-3 text-muted-foreground">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>

            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          ERP System • Error Code: 404
        </p>
      </div>
    </section>
  );
};

export default NotFound;
