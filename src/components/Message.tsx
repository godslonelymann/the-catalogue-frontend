export function Message({ title, text }: { title: string; text?: string }) {
  return (
    <div className="message">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
