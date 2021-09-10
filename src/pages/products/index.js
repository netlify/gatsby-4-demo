import * as React from 'react'
import { Link } from 'gatsby'
import { Layout } from '../../layout/default'
import {
  postsListCss,
  postListItemCss,
  postTeaserCss,
  postTeaserTitleCss,
  postTeaserDescriptionCss,
  postTeaserLinkCss,
} from '../index.module.css'

export default function ProductListing({ serverData }) {
  if (!serverData) {
    return (
      <Layout>
        <p>No serverData. SSR probably isn't enabled.</p>
      </Layout>
    )
  }
  const { headers, method, url, query, params } = serverData?.context
  return (
    <Layout>
      <ul className={postsListCss}>
        {serverData.products.map((node) => {
          return (
            <li className={postListItemCss}>
              <div className={postTeaserCss}>
                <h2 className={postTeaserTitleCss}>
                  <Link
                    to={`/products/${node.slug}/`}
                    className={postTeaserLinkCss}
                  >
                    {node.name}
                  </Link>
                </h2>
                <p className={postTeaserDescriptionCss}>
                  <Link
                    to={`/products/${node.slug}/`}
                    className={postTeaserLinkCss}
                  >
                    {node.description}
                  </Link>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      <p>
        {JSON.stringify({
          headers: Object.fromEntries(headers.entries()),
          method,
          url,
          query,
          params,
        })}
      </p>
    </Layout>
  )
}

export async function getServerData(context) {
  const { default: fetch } = require('node-fetch')

  try {
    const res = await fetch(`https://graphql.us.fauna.com/graphql`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + 'fnAEOEwsPmAAQPSMCPst8le3PKMTqM-MT3WAihkC',
      },
      body: JSON.stringify({
        query: `
query allProducts {
  allProducts {
    data {
      name
      slug
      description
    }
  }
}

    `,
      }),
    })

    const { data, errors } = await res.json()
    if (errors) {
      console.log(errors)
      return {
        products: [],
      }
    }

    if (data) {
      return {
        props: {
          products: data.allProducts.data,
          context,
        },
        headers: {
          'x-test': 'hi',
        },
      }
    }
  } catch (err) {
    throw new Error(`error: ${err.message}`)
  }
}
