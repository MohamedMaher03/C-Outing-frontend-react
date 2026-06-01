export interface AccountRouteDescriptor {
  labelKey: string;
  descriptionKey: string;
  path: string;
}

export const PROFILE_ACCOUNT_ROUTES: AccountRouteDescriptor[] = [
  {
    labelKey: "profile.account.item.edit.label",
    descriptionKey: "profile.account.item.edit.description",
    path: "/profile/edit",
  },
  {
    labelKey: "profile.account.item.notifications.label",
    descriptionKey: "profile.account.item.notifications.description",
    path: "/profile/notifications",
  },
  {
    labelKey: "profile.account.item.privacy.label",
    descriptionKey: "profile.account.item.privacy.description",
    path: "/profile/privacy",
  },
  {
    labelKey: "profile.account.item.help.label",
    descriptionKey: "profile.account.item.help.description",
    path: "/profile/help",
  },
];

export interface LocalizedAccountRoute extends AccountRouteDescriptor {
  label: string;
  description: string;
}

type TranslateFn = (key: string) => string;

export const localizeAccountRoutes = (
  t: TranslateFn,
  routes: readonly AccountRouteDescriptor[] = PROFILE_ACCOUNT_ROUTES,
): LocalizedAccountRoute[] =>
  routes.map((route) => ({
    ...route,
    label: t(route.labelKey),
    description: t(route.descriptionKey),
  }));
