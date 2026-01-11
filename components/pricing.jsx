"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

const Pricing = () => {
  return (
    <Card className="border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent">
      <CardContent className="p-6 md:p-8">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            Subscription Plans Coming Soon
          </h3>
          <p className="text-muted-foreground mb-6">
            We're currently transitioning to a subscription model. 
            Subscription plans will be available soon.
          </p>
          <Link href="/pricing">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Learn More
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Pricing;
