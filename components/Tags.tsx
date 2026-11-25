export default function Tags({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="tags">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}
