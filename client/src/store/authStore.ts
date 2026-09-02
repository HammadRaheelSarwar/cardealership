import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  platformRole: 'user' | 'superAdmin';
  status: 'active' | 'invited' | 'suspended';
  emailVerified: boolean;
}

interface DealershipMembership {
  _id: string;
  dealershipId: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    status: string;
    timezone: string;
  };
  role: 'owner' | 'manager' | 'salesperson';
  permissions: string[];
  status: string;
}

type ApiUser = User & {
  id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  platform_role?: 'user' | 'super_admin';
  email_verified?: boolean;
};

type ApiMembership = DealershipMembership & {
  id?: string;
  dealership_id?: string;
  dealership?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    status: string;
    timezone: string;
  };
};

function normalizeUser(user: ApiUser): User {
  return {
    ...user,
    _id: user._id ?? user.id ?? '',
    firstName: user.firstName ?? user.first_name ?? '',
    lastName: user.lastName ?? user.last_name ?? '',
    avatar: user.avatar ?? user.avatar_url,
    platformRole:
      user.platformRole ?? (user.platform_role === 'super_admin' ? 'superAdmin' : 'user'),
    emailVerified: user.emailVerified ?? user.email_verified ?? false,
  };
}

function normalizeMembership(membership: ApiMembership): DealershipMembership {
  if (membership.dealershipId?._id) return membership;

  const dealership = membership.dealership;
  return {
    ...membership,
    _id: membership._id ?? membership.id ?? '',
    dealershipId: {
      _id: dealership?.id ?? membership.dealership_id ?? '',
      name: dealership?.name ?? 'DealerOS CRM',
      slug: dealership?.slug ?? '',
      logo: dealership?.logo_url,
      status: dealership?.status ?? 'active',
      timezone: dealership?.timezone ?? 'UTC',
    },
    permissions: membership.permissions ?? [],
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  memberships: DealershipMembership[];
  activeDealershipId: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (data: { user: ApiUser; accessToken: string; memberships?: ApiMembership[] }) => void;
  setAccessToken: (token: string) => void;
  setActiveDealership: (dealershipId: string) => void;
  setMemberships: (memberships: DealershipMembership[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      memberships: [],
      activeDealershipId: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, memberships = [] }) => {
        const normalizedUser = normalizeUser(user);
        const normalizedMemberships = memberships.map(normalizeMembership);
        const activeDealershipId =
          normalizedMemberships.length > 0 ? normalizedMemberships[0].dealershipId._id : null;
        set({
          user: normalizedUser,
          accessToken,
          memberships: normalizedMemberships,
          activeDealershipId,
          isAuthenticated: true,
        });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      setActiveDealership: (dealershipId) =>
        set({ activeDealershipId: dealershipId }),

      setMemberships: (memberships) => set({ memberships }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          memberships: [],
          activeDealershipId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'crm-auth',
      // Only persist non-sensitive state — access token is in-memory only
      partialize: (state) => ({
        user: state.user,
        activeDealershipId: state.activeDealershipId,
        memberships: state.memberships,
        // accessToken is NOT persisted — refresh token cookie handles re-auth
      }),
    }
  )
);

export const useActiveDealership = () => {
  const { memberships, activeDealershipId } = useAuthStore();
  return memberships.find((m) => m.dealershipId._id === activeDealershipId) ?? null;
};

export const useActiveMembershipRole = (): string | null => {
  const membership = useActiveDealership();
  return membership?.role ?? null;
};
