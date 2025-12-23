/**
 * Optional layout for your other site route
 * This allows you to customize the page without affecting the root layout
 * 
 * If you want to use the default layout, you can delete this file.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Other Site',
  description: 'Your other website',
};

export default function OtherSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

