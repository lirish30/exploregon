const isAuthenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const contentCollectionAccess = {
  read: () => true,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: isAuthenticated
}

export const contentGlobalAccess = {
  read: () => true,
  update: isAuthenticated
}
