import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // use unique key per client so rate limiting actually works
    const key = req.ip; // every user will have a different unique id, so that's the key to ratelimit user  

    const { success } = await ratelimit.limit(key); // Destructure the success property
    
    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later" });
    }
    
    // if not limited, then call the next() function
    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
