import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "pressable inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "btn-shadow-primary bg-primary text-primary-foreground hover:brightness-110",
                secondary:
                    "btn-shadow-secondary bg-white text-[#051A24] hover:bg-white",
                tertiary:
                    "btn-shadow-primary btn-shadow-secondary bg-white text-[#051A24] hover:bg-white",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
                outline:
                    "border border-border bg-white shadow-xs hover:bg-secondary",
                ghost:
                    "hover:bg-secondary hover:text-foreground",
                link: "text-foreground underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-5 py-2 has-[>svg]:px-4",
                sm: "h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
                lg: "h-12 rounded-2xl px-7 text-[0.95rem] has-[>svg]:px-5",
                icon: "size-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);