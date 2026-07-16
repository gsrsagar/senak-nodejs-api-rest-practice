import jwt from "jsonwebtoken";

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: "Unauthorized", 
      message: "Authorization token is missing." 
    });
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({ 
      error: "Unauthorized", 
      message: "Authorization token must be in the format 'Bearer <token>'." 
    });
  }

  const token = tokenParts[1];

  try {
    const secret = process.env.JWT_SECRET || "senak360_jwt_default_secret_key";
    const decoded = jwt.verify(token, secret);
    
    // Inject decoded user details into the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    
    let message = "Invalid authorization token.";
    if (error.name === "TokenExpiredError") {
      message = "Authorization token has expired.";
    }

    return res.status(401).json({ 
      error: "Unauthorized", 
      message 
    });
  }
}
