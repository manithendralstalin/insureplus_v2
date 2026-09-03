"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { contactSchema, type ContactInput } from "@/lib/schemas";

export function ContactForm() {
  const [done, setDone] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(data.ticketId);
      reset();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl glass p-8 text-center"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </span>
        <h3 className="mt-5 text-2xl font-bold">Message sent!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your ticket <span className="font-semibold text-white">{done}</span> has been created. Our
          team will get back to you within 24 hours.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setDone(null)}>
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl glass p-6 md:p-8">
      <h3 className="mb-6 text-lg font-bold">Send us a message</h3>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" invalid={!!errors.name} placeholder="Your name" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" invalid={!!errors.email} placeholder="you@example.com" {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
          <Input id="phone" invalid={!!errors.phone} placeholder="+91 98765 43210" {...register("phone")} />
        </Field>
        <Field label="Subject" htmlFor="subject" required error={errors.subject?.message}>
          <Input id="subject" invalid={!!errors.subject} placeholder="How can we help?" {...register("subject")} />
        </Field>
        <Field label="Message" htmlFor="message" required error={errors.message?.message} className="sm:col-span-2">
          <Textarea id="message" invalid={!!errors.message} placeholder="Write your message…" {...register("message")} />
        </Field>
      </div>

      {serverError && (
        <p className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Message</>}
      </Button>
    </form>
  );
}
