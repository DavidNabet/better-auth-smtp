import Wrapper from "@/app/_components/Wrapper";
import { getOrganizationBySlug } from "@/lib/organization/organization.utils";
import { getUsersByOrganizationId } from "@/lib/user/user.utils";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Organization Details",
};
export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const organization = await getOrganizationBySlug(slug);
  //console.log("org: ", organization);
  // users non présents dans l'organization
  const users = await getUsersByOrganizationId(organization?.id || "");
  return (
    <Wrapper title="Organization Details">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 py-10">
        <h2 className="font-bold text-2xl">{organization?.name}</h2>
      </div>
    </Wrapper>
  );
}
