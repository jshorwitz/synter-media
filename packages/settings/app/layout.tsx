import './globals.css';

export const metadata = {
  title: 'Synter Media Settings',
  description: 'Manage your Synter Media account settings, billing, team, and sharing preferences',
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
