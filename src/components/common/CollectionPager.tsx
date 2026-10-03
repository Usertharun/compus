import { useApp, type Collection } from '@/context/AppContext';
import { hasNextPage } from '@/services/pagination';

export default function CollectionPager({ collections }: { collections: Collection[] }) {
  const { pages, paging, loadMoreCollection } = useApp();
  return <div className="flex flex-wrap gap-3 items-center py-4">
    {collections.map(key => {
      const page = pages[key];
      if (!page || !hasNextPage(page)) return null;
      return <button key={key} disabled={paging[key]} className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50" onClick={() => void loadMoreCollection(key)}>
        {paging[key] ? 'Loading…' : `Load more ${key === 'savedOpportunities' ? 'saved opportunities' : key === 'savedPosts' ? 'saved posts' : key === 'organizedEvents' ? 'hosted events' : key}`}
      </button>;
    })}
  </div>;
}
