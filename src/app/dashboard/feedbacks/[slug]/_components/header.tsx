import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";

interface BlogHeaderProps {
  category: string;
  title: string;
  author: Prisma.UserGetPayload<{
    select: { name: true; image: true; role: true };
  }>;
  publishedDate: string;
}

export default function Header(props: BlogHeaderProps) {
  if (!props) return;
  return (
    <header className="space-y-6">
      <Badge variant="outline">{props.category}</Badge>

      <h1 className="text-foreground text-4xl leading-15 font-bold tracking-tight md:text-4xl lg:text-5xl">
        {props.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={props.author.image!}
              alt={props.author.name!}
              className="object-cover"
            />
            <AvatarFallback>{props.author?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">by {props.author.name}</p>
            <p className="text-muted-foreground text-sm">
              {props.publishedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            Share this
          </span>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-blog-hover h-9 w-9 rounded-full"
          >
            <Twitter />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-blog-hover h-9 w-9 rounded-full"
          >
            <Facebook />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-blog-hover h-9 w-9 rounded-full"
          >
            <Linkedin />
          </Button>
        </div>
      </div>
    </header>
  );
}
