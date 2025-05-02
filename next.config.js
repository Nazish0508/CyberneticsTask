/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
};

module.exports = {
  images: {
    domains: ['your-bucket-name.s3.amazonaws.com'],
  },
};

