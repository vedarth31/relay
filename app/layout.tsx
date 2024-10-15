import './globals.css';

export const metadata = {
  title: 'Order Management System',
  description: 'TAMU Formula Electric Order Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
