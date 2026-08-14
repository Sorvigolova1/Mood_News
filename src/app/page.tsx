import NewsListClient from '@/widgets/NewsList/ui/NewsListClient';

export default function Home() {
  return (
    <main >
      
<h1 className="
  text-3xl md:text-5xl font-bold text-center m-5
  text-[var(--text-primary)]
">
  Эмоциональные Новости
</h1>
        <NewsListClient />
      
    </main>
  );
}