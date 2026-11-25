import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sec">
      <h2 className="page-title">404</h2>
      <p className="page-lead">페이지를 찾을 수 없어요</p>
      <Link href="/" className="more">
        처음으로 →
      </Link>
    </section>
  );
}
