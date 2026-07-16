// Member
export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  createdAt: Date;
  organization: { slug: string; id: string };
  teamMembers: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }[];
};

export type Invitation = {
  organizationId: string;
  id: string;
  role: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  status: string;
  inviterId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type User = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  role: string;
  createdAt: Date;
};
