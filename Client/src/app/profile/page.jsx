
import ProfileDashboard from '../../pages/ProfileDashboard'

export const metadata = {
  title: 'My Profile',
  description: 'Manage your HeartEcho AI profile and companion preferences.',
  alternates: {
    canonical: 'https://heartecho.in/profile',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <ProfileDashboard/>
}
