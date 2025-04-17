import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold text-black">ComputeX</h1>
        <nav className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("#")}>
            <Crown size={18} />
            Buy Premium
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-8 px-4">
        <h2 className="text-5xl font-bold mb-4">Welcome to ComputeX</h2>
        <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
          Supercharge your number crunching with lightning-fast processing for
          massive lists, Fibonacci series, and matrices using distributed
          Flask-powered computation.
        </p>
        <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center">
          <Button className="px-6 py-3" onClick={() => navigate("/fibo")}>
            Generate Fibonacci
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/short")}>
            Sort a Big List
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/matrix")}>
            Multiply Matrices
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/Factorial")}>
            Generate Factorial
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/Word Count")}>
            Word Count
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/Prime")}>
            Prime Number
          </Button>
          <Button className="px-6 py-3" onClick={() => navigate("/Image")}>
            Image Processing
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-8 bg-white">
        <h3 className="text-3xl font-semibold text-center mb-12">
          Why Use ComputeX?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Parallel Sorting</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Efficiently sort billions of numbers using distributed Flask
                servers for lightning-fast results.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Giant Fibonacci</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Generate massive Fibonacci sequences up to the billionth
                position without freezing your browser.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Matrix Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Multiply large matrices effortlessly with backend-powered
                distributed computation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Factorial Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Compute factorials of extremely large numbers with optimized
                algorithms running on backend.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Word Counter</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Quickly analyze documents or strings for word frequency and
                counts using intelligent parsing.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Prime Detector</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Determine if a number is prime and generate lists of primes
                efficiently with backend support.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow md:col-span-3">
            <CardHeader>
              <CardTitle>Image Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Leverage AI-assisted and algorithmic backend systems to analyze
                and enhance images for computation-heavy tasks.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t mt-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} ComputeX. Built for high-performance
        computing needs.
      </footer>
    </div>
  );
};

export default LandingPage;
