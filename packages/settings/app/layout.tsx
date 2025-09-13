import './globals.css';

export const metadata = {
  title: 'Synter Settings',
  description: 'Manage your Synter account settings, billing, team, and sharing preferences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
