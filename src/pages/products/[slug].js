// @ts-check
import { Link } from "gatsby";
import * as React from "react";
import { Layout } from "../../layout/default";

export default function BlogPostTemplate({ serverData }) {
  if (!serverData) {
    return (
      <Layout>
        <p>No serverData. SSR probably isn't enabled.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <nav>
          <Link to={`/products/`}>&larr; Back to Products</Link>
        </nav>
        <header>
          <h1 itemProp="headline">{serverData.name}</h1>
          <p>This page is SSR</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: serverData.description }}
          itemProp="articleBody"
        />
        <hr />
      </article>
    </Layout>
  );
}

export async function getServerData({ params }) {
  const { default: fetch } = require("node-fetch");

  try {
    const res = await fetch(`https://graphql.us.fauna.com/graphql`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + "fnAEOEwsPmAAQPSMCPst8le3PKMTqM-MT3WAihkC",
      },
      body: JSON.stringify({
        query: `
query findProduct($slug: String!) {
  findProductBySlug(slug: $slug) {
      name
      description
  }
}

    `,
        variables: { slug: params.slug },
      }),
    });

    const { data, errors } = await res.json();
    if (errors) {
      throw new Error("Error loading product");
      console.log(errors);
    }

    if (data) {
      return data.findProductBySlug;
    }
  } catch (err) {
    throw new Error(`error: ${err.message}`);
  }
}
