const studentMiddleware = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "STUDENT"
  ) {
    return res.status(403).json({
      success: false,
      message: "Student access required",
    });
  }

  next();
};

module.exports = studentMiddleware;