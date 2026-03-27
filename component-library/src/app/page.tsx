'use client';

import { ContactDraftProvider } from '@/components/ContactDraftContext';
import { LibraryWorkspace } from '@/components/LibraryWorkspace/LibraryWorkspace';

export default function Home() {
  return (
    <ContactDraftProvider>
      <LibraryWorkspace />
    </ContactDraftProvider>
  );
}
