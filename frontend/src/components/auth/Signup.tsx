import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Chrome, Twitter, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function SignUp() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange", // This enables real-time validation
  });

  const onSubmit = async (values) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(values);
      toast({
        title: "Account created.",
        description: "We've created your account for you.",
      });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">Sign up for an account</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link to="/signin" className="font-medium text-primary hover:text-primary-foreground">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>
        <div className="flex items-center justify-between">
          <div className="flex-1 border-t border-muted" />
          <span className="mx-4 text-sm font-medium text-muted-foreground">or</span>
          <div className="flex-1 border-t border-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full">
            <Chrome className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
          <Button variant="outline" className="w-full">
            <Twitter className="mr-2 h-5 w-5" />
            Sign up with Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}