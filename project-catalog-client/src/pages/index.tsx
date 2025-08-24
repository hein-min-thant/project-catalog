// src/pages/projects/index.tsx
"use client";
import { title } from "@/components/primitives";
import api from "@/config/api";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const user = api.get("/users/me");

  console.log(user);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Index</h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
