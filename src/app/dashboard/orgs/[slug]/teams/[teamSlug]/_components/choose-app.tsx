"use client";

import {
  Fragment,
  useEffect,
  useId,
  useState,
  useActionState,
  useRef,
} from "react";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import * as C from "@/components/ui/combobox";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { App } from "@prisma/client";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { useRouter, useParams } from "next/navigation";
import { setTeamToApp } from "@/lib/organization/organization.action";
import { ErrorMessages } from "@/app/_components/ErrorMessages";

export default function ChooseApp({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const params = useParams();
  const [appli, setAppli] = useState<App[]>([]);
  const [checked, setChecked] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const anchor = C.useComboboxAnchor();
  const id = useId();

  const toastCallbacks = createToastCallbacks({
    loading: "Application en attente...",
  });

  const [state, action, pending] = useActionState(
    withCallbacks(setTeamToApp, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
        formRef.current?.reset();
        router.back();
      },
    }),
    null,
  );

  const fetchApps = async () => {
    const res = await fetch(`/api/organizations/${organizationId}/apps`, {
      cache: "no-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch available members");
    return res.json() as Promise<{
      apps: App[];
      total: number;
    }>;
  };

  useEffect(() => {
    if (!organizationId) return;
    fetchApps().then(({ apps }) => {
      setAppli(apps);
    });
  }, [organizationId]);

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Choisir des applications</CardTitle>
            <CardDescription>
              Choisissez une ou plusieurs applications pour cette équipe
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="setActiveTeam" ref={formRef} action={action}>
          <div className="grid grid-cols-1 gap-3 space-y-4">
            {params?.teamSlug && (
              <input type="hidden" name="teamSlug" value={params.teamSlug} />
            )}
            <div className="col-span-6">
              <Label htmlFor={id} className="block text-sm font-medium">
                Veuillez choisir
              </Label>
              {!appli || appli.length === 0 ? (
                <LoadingIcon />
              ) : (
                <>
                  <C.Combobox
                    items={appli}
                    multiple
                    id={id}
                    name="appName"
                    defaultValue={[appli[0].name] as const}
                  >
                    <C.ComboboxChips ref={anchor} className="w-full max-w-xs">
                      <C.ComboboxValue>
                        {(values) => (
                          <>
                            {values.map((item: any) => (
                              <C.ComboboxChip key={item}>{item}</C.ComboboxChip>
                            ))}
                          </>
                        )}
                      </C.ComboboxValue>
                    </C.ComboboxChips>
                    <C.ComboboxContent anchor={anchor}>
                      <C.ComboboxEmpty>
                        Applications inexistantes
                      </C.ComboboxEmpty>
                      <C.ComboboxList>
                        {(item: App) => (
                          <C.ComboboxItem key={item.name} value={item.name}>
                            {item.name}
                          </C.ComboboxItem>
                        )}
                      </C.ComboboxList>
                    </C.ComboboxContent>
                  </C.Combobox>
                  <ErrorMessages
                    errors={state?.errorMessage?.appName ?? null}
                  />
                </>
              )}
            </div>
            <div className="col-span-6 gap-x-6">
              <Button
                type="submit"
                form="setActiveTeam"
                className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
                variant="default"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    En attente...
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="size-4" />
                    Continuer
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
