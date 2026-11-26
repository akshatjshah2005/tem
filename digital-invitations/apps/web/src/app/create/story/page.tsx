import { redirect } from 'next/navigation';

// The love story builder now lives on /love-story.
export default function CreateStoryRedirect() {
  redirect('/love-story#builder');
}
