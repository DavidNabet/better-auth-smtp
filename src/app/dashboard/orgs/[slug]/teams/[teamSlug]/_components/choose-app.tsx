import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightIcon } from "lucide-react";

export default function ChooseApp() {
  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Choisir une application</CardTitle>
            <CardDescription>
              Choisissez une application pour cette équipe
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="setActiveTeam">
          <div className="grid grid-cols-1 gap-3 space-y-4">
            <div className="col-span-6">
              <Label htmlFor="app" className="block text-sm font-medium">
                Choisir une application
              </Label>
              <Select name="app">
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Quelle application faut-il suivre ?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=""></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6 gap-x-6">
              <Button
                type="submit"
                form="setActiveTeam"
                className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
                variant="default"
              >
                <ArrowRightIcon className="size-4" />
                Continuer
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
