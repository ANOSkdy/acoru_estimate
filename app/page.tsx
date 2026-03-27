export default function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <h1>Acoru Estimate Starter</h1>
        <p>
          Minimal build-safe Next.js App Router + TypeScript baseline with server-only Neon Postgres APIs.
        </p>
        <ul>
          <li>
            Health: <code>/api/health/db</code>
          </li>
          <li>
            Todos: <code>/api/todos</code>
          </li>
          <li>
            Todo by id: <code>/api/todos/[id]</code>
          </li>
        </ul>
        <p>Run migrations with: <code>pnpm db:migrate</code></p>
      </section>
    </main>
  );
}
