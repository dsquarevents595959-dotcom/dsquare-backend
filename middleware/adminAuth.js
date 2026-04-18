const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || "fallback_secret";

console.log("AdminAuth middleware initialized", {
  hasJWTSecret: !!process.env.JWT_SECRET,
  hasADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  hasAdminPassword: !!process.env.ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV
});

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL || "akeventsandfireworks@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "AkEvents@98";
  
  return {
    email: email.trim().toLowerCase(),
    password: String(password).trim(),
  };
}

function signToken() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  
  try {
    const token = jwt.sign(
      { 
        role: "admin",
        timestamp: Date.now()
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );
    
    console.log("Token signed successfully");
    return token;
  } catch (error) {
    console.error("Error signing token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    console.log('Verifying token with secret:', !!JWT_SECRET);
    
    console.log("Token verification attempt", {
      hasToken: !!token,
      hasJWTSecret: !!JWT_SECRET,
      headerLength: header.length
    });
    
    if (!token) {
      return res.status(401).json({ 
        ok: false, 
        message: "Authentication token is required" 
      });
    }
    
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured in production");
      return res.status(500).json({ 
        ok: false, 
        message: "Server configuration error" 
      });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      console.log("Token verified successfully");
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({ 
        ok: false, 
        message: "Invalid or expired authentication token" 
      });
    }
    
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ 
      ok: false, 
      message: "Authentication server error" 
    });
  }
}

module.exports = { 
  getAdminCredentials, 
  signToken, 
  verifyToken, 
  JWT_SECRET 
};
