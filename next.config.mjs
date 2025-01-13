/** @type {import('next').NextConfig} */

// Helper function to validate domain
const isValidDomain = (domain) => {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,63}$/; // Match valid domain names
  return domainRegex.test(domain);
};

// Default image domains
const defaultDomains = ["images.app.goo.gl", "static.vecteezy.com"];

// Load additional domains from environment variables
const additionalDomains = (process.env.ALLOWED_IMAGE_DOMAINS || "")
  .split(",")
  .map((domain) => domain.trim())
  .filter((domain) => isValidDomain(domain)); // Ensure only valid domains are added

// Combine default and additional domains, removing duplicates
const imageDomains = [...new Set([...defaultDomains, ...additionalDomains])];

const nextConfig = {
  images: {
    domains: imageDomains, // External domains for URL-based images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all hosts for remote images
      },
    ],
  },
};

export default nextConfig;
