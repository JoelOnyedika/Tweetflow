import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Chrome, Twitter, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/customs/Toast";
import { setCookie, getCsrfToken } from '@/lib/funcs'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function Login() {
  const { showToast, ToastContainer } = useToast(); // Use our custom toast hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });


  const onSubmit = async (values: any) => {
    try {
      const csrfToken = await getCsrfToken()
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/login/`,  {
        method: "POST",
        headers: {"Content-Type": "application/json", "X-CSRFToken": csrfToken},
        body: JSON.stringify(values),
        credentials: 'include'
      })
      const data = await response.json()
      console.log(data)

      if (response.ok) {
        showToast("Login successful. Welcome back!", "info");
        setCookie('user_id', data.data.id, 7)
        // setCookie('sessionid', data.data.sessionId, 7)
        // console.log(data.data.sessionId)
        window.location.href = `/${data.data.id}/createvideo`
      } else {
        showToast(data.error, 'error')
      }
    } catch (error) {
      console.log(error)
      showToast("Login failed. Please check your credentials and try again.", "error");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <title>Login to Tweetflow</title>
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">Log in to your account</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{" "}
              <Link to="/signup" className="font-medium text-primary hover:text-primary-foreground">
                create a new account
              </Link>
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    Logging in...
                  </>
                ) : (
                  "Log in"
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
            <Button variant="outline" className="w-full" onClick={() => console.log("Google login")}>
              <Chrome className="mr-2 h-5 w-5" />
              Log in with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => console.log("X login")}>
              <Twitter className="mr-2 h-5 w-5" />
              Log in with X
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer /> {/* Render the ToastContainer */}
    </>
  );
}