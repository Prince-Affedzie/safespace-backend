// jsonwebtoken lets us verify the token the user sends
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // The token is sent in the request headers under "Authorization"
  // It looks like: "Bearer eyJhbGci..."
  // We split by space and take the second part (the actual token)
  const authHeader = req.headers.authorization;

  // If no Authorization header was sent, reject the request
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  // Extract the token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify() checks if the token is valid and not expired
    // If valid, it returns the payload we stored inside it
    // which contains { userId, name }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request object
    // This makes req.user available in any route that uses this middleware
    req.user = decoded;

    // next() tells Express to move on to the actual route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, reject the request
    res.status(401).json({ message: "Invalid token, access denied" });
  }
};

export default authMiddleware;
