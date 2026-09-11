const isAuthenticated = (req, res, next) => {
  // If session exists and has an adminId, let them through
  if (req.session && req.session.adminId) {
    return next();
  }
  // Otherwise, back to login
  res.redirect("/admin/login");
};

const isGuest = (req, res, next) => {
  // If they are already logged in, don't let them see the login page again
  if (req.session && req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }
  next();
};

module.exports = { isAuthenticated, isGuest };
