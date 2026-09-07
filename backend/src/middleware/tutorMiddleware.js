const tutorMiddleware = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "FACULTY" ||
    req.user.facultyType !== "TUTOR"
  ) {
    return res.status(403).json({
      success: false,
      message: "Tutor access required",
    });
  }

  next();
};

module.exports = tutorMiddleware;