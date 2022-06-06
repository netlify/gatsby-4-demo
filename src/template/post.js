import * as React from 'react'
import { graphql, Link } from 'gatsby'
import { Layout } from '../layout/default'
import { containerCss } from './post.module.css'

export default function BlogPostTemplate({ data, pageContext }) {
  console.log(JSON.stringify(data, null, 2))
  const post = data.markdownRemark

  return (
    <Layout>
      <article
        className={containerCss}
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        <Link to={`/blog/${pageContext.slug}`}>SSG version</Link>

        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
      </article>
    </Layout>
  )
}

/**
 * Example of DSG per path using fs Routes
 */

export async function config() {
  // Optionally use GraphQL here
  return ({ params }) => {
    return {
      defer: params.slug !== 'hello-world',
    }
  }
}

/**
 * Example of DSG for all routes
 */
// export const config = {
//   defer: true,
// }

export const query = graphql`
  query ($id: String) {
    allMarkdownRemark {
      nodes {
        id
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
      # slug
    }
  }
`
