import { CardButton } from "@/app/_components/Card";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { User, Lock } from "lucide-react";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <Wrapper title="Settings">
      <Suspense fallback={<LoadingIcon />}>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <CardButton
            title="Profile"
            description="Tu peux modifier ton profil, ta photo et ton nom de compte!"
            href="/dashboard/settings/details"
            label="Voir"
            icon={<User />}
          />

          <CardButton
            title="Security"
            description="Tu peux changer ton mot de passe et passer en mode 2FA!"
            href="/dashboard/settings/security"
            label="Voir"
            icon={<Lock />}
          />
        </div>
      </Suspense>
    </Wrapper>
  );
}
