/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  env: {
    GOOGLE_CLIENT_ID: '911452289802-r37kaflvcvkvm9mrhehataqmka7hlnti.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'AIzaSyChQ1v_FDqWGz-TA7yFPcSoPBytfqQ8J-4',
    VERCEL_FORCE_NO_BUILD_CACHE: '1'
  },
}
