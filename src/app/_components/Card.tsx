import { ComponentProps, ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CardProps = ComponentProps<typeof Card>;

interface ICard {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ReactNode;
  boxed?: boolean;
  actions?: ReactNode;
}

interface ICardLink {
  href: string;
  label: string;
}

// Create a responsive grid layout card

export function CardInner({
  title,
  description,
  children,
  className,
  boxed,
  actions,
  ...props
}: ICard & CardProps) {
  return (
    <Card className={cn("mt-8", className, boxed && "md:w-[380px]")} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription className="text-metal">
            {description}
          </CardDescription>
        )}
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function CardButton({
  icon,
  title,
  description,
  href,
  label,
  className,
  ...props
}: ICard & ICardLink & CardProps) {
  return (
    <Card className={cn("p-6 border-4 border-teal-500", className)} {...props}>
      <div className="flex gap-4 md:gap-6 ">
        {icon && (
          <Button
            variant="default"
            size="icon"
            className="[&_svg]:!size-6 h-12 w-12 rounded-lg bg-teal-500 text-white shadow-lg md:h-14 md:w-14 md:rounded-xl"
          >
            {icon}
          </Button>
        )}
        <div>
          <CardTitle className="mb-2 text-lg">{title}</CardTitle>
          <CardDescription className="mb-2 text-base">
            {description}
          </CardDescription>
          <CardContent className="px-0">
            <Link
              href={href}
              title={label}
              className="font-bold text-teal-500 transition duration-100 hover:text-teal-600 active:text-teal-700"
            >
              {label}
            </Link>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
