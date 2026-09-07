const hodMiddleware = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "FACULTY" ||
    req.user.facultyType !== "HOD"
  ) {
    return res.status(403).json({
      success: false,
      message: "HOD access required",
    });
  }

  next();
};

module.exports = hodMiddleware;