'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup } from '@/app/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = isSignUp ? signup : login;
    const result = await action(formData);

    if (result?.error) {
       toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: result.error,
      });
    }
  }

  const title = isSignUp ? "Create Admin Account" : "Welcome Back";
  const description = isSignUp 
    ? "Create an account to get started." 
    : "Enter your credentials to access the dashboard.";
  const buttonText = isSignUp ? "Create Account & Enter" : "Enter Shop";
  const toggleText = isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up";

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full">
          {buttonText}
        </Button>
        <Button variant="link" size="sm" type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {toggleText}
        </Button>
      </CardFooter>
    </form>
  );
}
