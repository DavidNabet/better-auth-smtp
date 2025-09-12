import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { CardInner } from "@/app/_components/Card";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type Feedback = {
  id: string;
  title: string;
  date: string | Date;
  subject: string;
  content: string;
  team: {
    id: number;
    avatar: string;
  }[];
};

export function FeedbackList({ feedbacks = [] }: { feedbacks: Feedback[] }) {
  return (
    <div className="grid grid-cols-12 sm:grid-cols-3 gap-6 p-4">
      <>
        {feedbacks?.length === 0 ? (
          <div className="text-sm text-muted-foreground px-3 py-4 border rounded-lg">
            <p>No ideas to display.</p>
          </div>
        ) : (
          feedbacks?.map((f) => (
            <Card className="border rounded-md py-0" key={f.id}>
              <div className="flex gap-2 h-full">
                <div className="h-full py-4 bg-accent/30">
                  <div className="flex flex-col items-stretch px-2">
                    <Button variant="ghost" size="icon">
                      <ChevronUp />
                    </Button>
                    <span className="text-3xl text-primary font-light border-primary">
                      28
                    </span>
                    <Button variant="ghost" size="icon">
                      <ChevronDown />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 w-full py-4">
                  <CardHeader className="pl-0">
                    <CardTitle>{f.subject}</CardTitle>
                    <span className="mt-1 text-xs text-card-foreground">
                      {f.title}
                    </span>
                    <CardDescription>{f.content}</CardDescription>
                  </CardHeader>

                  <CardFooter className="px-2 pt-3 flex items-center justify-between">
                    <div className="*:data-[slot=avatar]:ring-accent flex -space-x-2 *:data-[slot=avatar]:ring-2">
                      {f.team.map((t) => (
                        <Avatar key={t.id}>
                          <AvatarImage
                            src={t.avatar}
                            alt={t.avatar.slice(2, 4).toUpperCase()}
                          />
                          <AvatarFallback>
                            {t.avatar.slice(2, 4).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))
        )}
      </>
    </div>
  );
}
