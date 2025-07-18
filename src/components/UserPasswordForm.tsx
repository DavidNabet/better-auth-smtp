import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserPasswordForm() {
  return (
    <form className="mt-8 grid grid-cols-6 gap-6">
      <div className="col-span-6">
        <Label htmlFor="oldPassword" className="block text-sm font-medium">
          Ancien mot de passe
        </Label>

        <Input
          type="password"
          id="oldPassword"
          name="oldPassword"
          placeholder="••••••••"
          className="mt-1 w-full "
        />
      </div>
      <div className="col-span-6">
        <Label htmlFor="newPassword" className="block text-sm font-medium ">
          Nouveau mot de passe
        </Label>

        <Input
          type="password"
          id="newPassword"
          name="newPassword"
          placeholder="••••••••"
          className="mt-1 w-full"
        />
      </div>
      <div className="col-span-6">
        <Label
          htmlFor="passwordConfirmation"
          className="block text-sm font-medium"
        >
          Confirmation du mot de passe
        </Label>

        <Input
          type="password"
          id="passwordConfirmation"
          name="passwordConfirmation"
          placeholder="••••••••"
          className="mt-1 w-full"
        />
      </div>
      <div className="mt-6 col-span-6 gap-x-6">
        <Button
          type="submit"
          variant="default"
          className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
        >
          Update Password
        </Button>
      </div>
    </form>
  );
}
