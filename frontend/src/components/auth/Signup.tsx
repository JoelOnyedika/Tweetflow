import React from "react";
import { Link, redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Chrome, Twitter, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/customs/Toast";
import { getCsrfToken, setCookie } from '@/lib/funcs'

const formSchema = z.object({
  username: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const SignUp = () => {
  const { showToast, ToastContainer } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


  const onSubmit = async (values) => {
    try {
      const csrfToken = await getCsrfToken()
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log(data)
      
      if (response.ok) {
        showToast("Sign up successful. Welcome!", "success");
        console.log(data.data.id)
        window.location.href = `/${data.data.id}/createvideo`;
      } else {
        if (data.error && typeof data.error === 'object') {
          // Handle validation errors
          const errorMessage = Object.values(data.error).flat().join('. ');
          showToast(errorMessage, "error");
        } else {
          showToast(data.error || "Sign up failed. Please try again.", "error");
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      showToast("An unexpected error occurred. Please try again later.", "error");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">Sign up for an account</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{" "}
              <Link to="/login" className="font-medium text-primary hover:text-primary-foreground">
                sign in to your existing account
              </Link>
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {form.formState.errors.username && (
                      <p className="mt-1 text-sm text-red-500">{form.formState.errors.username.message}</p>
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
            <Button variant="outline" className="w-full" onClick={() => console.log("Google signup")}>
              <Chrome className="mr-2 h-5 w-5" />
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => console.log("X signup")}>
              <Twitter className="mr-2 h-5 w-5" />
              Sign up with X
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default SignUp;