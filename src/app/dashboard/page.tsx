import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { Suspense } from "react";
import { CardInner } from "@/app/_components/Card";
import { UsersTable, LogDisplay } from "@/components/Table/Tables";
import { GenerateUsers } from "@/components/GenerateUsers";
import { getCurrentServerSession } from "@/lib/session/server";
import Link from "next/link";

/** TODO : Plateforme de feedback / idées collaboratives
Nom de l'app: MVPBetter
Les utilisateurs postent des idées ou suggestions.

Les autres votent pour mettre en avant les meilleures.

Les admins/modérateurs gèrent les abus, suppriment le contenu inapproprié.
Chaque post peut-être liké/upvoté
Tu peux ajouter des features comme des badges ou niveaux selon l’activité.
 
➡️ Exemple : Canny.io, utilisé par des startups pour gérer le feedback produit.*/

// ⚠ Créer un upvote avec des commentaires pour les utilisateurs, les moderateurs pourront ban les users qui ont été odieux ou insultant. Les commentaires peuvent être likés par les users.
export default async function Dashboard() {
  const { userEmail, userName, userRole, userId } =
    await getCurrentServerSession();

  if (!userRole) {
    return null;
  }

  return (
    <Wrapper title={`Welcome ${userName}`}>
      <p>Content</p>
      <span>
        {userEmail
          ? userEmail.replace(/^[^@]+/, "*".repeat(userEmail.indexOf("@")))
          : null}
      </span>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:place-items-stretch">
        {userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? (
          <>
            <section className="col-span-6 md:col-span-3">
              <Suspense fallback={<LoadingIcon />}>
                <CardInner
                  title="Créer des utilisateurs ?"
                  description="Générer des utlisateurs"
                >
                  <GenerateUsers userId={userId.slice(2, 6)} />
                </CardInner>
              </Suspense>

              <Suspense fallback={<LoadingIcon />}>
                <CardInner
                  title="Log"
                  description="Log de modérations"
                  actions={
                    <Link
                      href={`/dashboard/users/${userRole?.toLowerCase()}/#moderation_logs`}
                      className="text-primary text-sm underline"
                    >
                      Voir plus
                    </Link>
                  }
                >
                  <LogDisplay />
                </CardInner>
              </Suspense>
            </section>
            <section className="col-span-6 md:col-span-5">
              <Suspense fallback={<LoadingIcon />}>
                <CardInner
                  title="Nombre de users"
                  description="Nombre de users inscrits"
                  actions={
                    <Link
                      href={`/dashboard/users/${userRole?.toLowerCase()}`}
                      className="text-primary text-sm underline"
                    >
                      Voir plus
                    </Link>
                  }
                >
                  <UsersTable />
                </CardInner>
              </Suspense>
            </section>
          </>
        ) : (
          userRole !== "USER" && (
            <div className="col-span-6">
              <Suspense fallback={<LoadingIcon />}>
                <CardInner
                  title="Nombre de users"
                  description="Nombre de users inscrits"
                  actions={
                    <Link
                      href={`/dashboard/users/${userRole?.toLowerCase()}`}
                      className="text-primary text-sm underline"
                    >
                      Voir plus
                    </Link>
                  }
                >
                  <UsersTable />
                </CardInner>
              </Suspense>
            </div>
          )
        )}
      </div>
    </Wrapper>
  );
}
