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
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CardProps = ComponentProps<typeof Card>;

interface ICard {
  title: string;
  description?: string;
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
  children,
  boxed,
  actions,
  ...props
}: ICard & Partial<ICardLink> & CardProps) {
  const classNames = {
    icon: {
      default:
        "[&_svg]:!size-6 h-12 w-12 rounded-lg bg-teal-500 text-white shadow-lg md:h-14 md:w-14 md:rounded-xl",
      secondary: "flex size-8 items-center justify-center rounded-lg bg-muted",
    },
  };
  return (
    <Card className={cn("p-6 border-4 border-teal-500", className)} {...props}>
      <div
        className={cn("flex gap-2", boxed && "items-center justify-between")}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <Button
              variant="secondary"
              size="icon"
              className={
                boxed ? classNames.icon.secondary : classNames.icon.default
              }
            >
              {icon}
            </Button>
          )}
          {boxed ? (
            <CardTitle className="mb-0">{title}</CardTitle>
          ) : (
            <div>
              <CardTitle className="mb-2 text-lg">{title}</CardTitle>
              <CardDescription className="mb-2 text-base">
                {description}
              </CardDescription>
              <CardContent className="px-0">
                <Link
                  href={href!}
                  title={label}
                  className="font-bold text-teal-500 transition duration-100 hover:text-teal-600 active:text-teal-700"
                >
                  {label}
                </Link>
              </CardContent>
            </div>
          )}
        </div>
        {actions && actions}
      </div>
      {boxed && <>{children}</>}
    </Card>
  );
}
