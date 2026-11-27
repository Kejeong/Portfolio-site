import { Fragment } from "react";
import { about } from "@/lib/profile";

// "**굵게**"만 굵은 글씨로 바꾼다
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>,
  );
}

export default function Home() {
  return (
    <div className="about">
      <header className="hero">
        <p className="hello">{about.hello}</p>
        <h2>{about.title}</h2>
        <p className="intro">{about.text}</p>
      </header>
      <h3 className="qa-title">{about.qaTitle}</h3>
      <div className="qa">
        {about.qa.map((item) => (
          <div key={item.q}>
            <p className="q">{item.q}</p>
            <p className="a">{withBold(item.a)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
