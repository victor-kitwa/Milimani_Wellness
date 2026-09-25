import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import {
  Input as BaseInput,
  Textarea as BaseTextarea,
  Select as BaseSelect,
  Field,
  Label,
  type InputVariant,
} from "@/components/ui/input";

/* Thin wrappers around the shared Input/Textarea/Select that default to the
   neumorphic "neu" variant, so the admin dashboard gets the pressed-in look
   (better light-theme contrast than a plain border) without touching the
   shared components' default styling, which the storefront (checkout,
   login) still relies on. Admin forms import these instead of
   @/components/ui/input; everything else about them is unchanged. */

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { variant?: InputVariant }
>(function Input({ variant = "neu", ...props }, ref) {
  return <BaseInput ref={ref} variant={variant} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: InputVariant }
>(function Textarea({ variant = "neu", ...props }, ref) {
  return <BaseTextarea ref={ref} variant={variant} {...props} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { variant?: InputVariant }
>(function Select({ variant = "neu", ...props }, ref) {
  return <BaseSelect ref={ref} variant={variant} {...props} />;
});

export { Field, Label };
