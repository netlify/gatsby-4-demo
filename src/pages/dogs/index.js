import * as React from 'react'
import { Layout } from '../../layout/default'
import { Link } from 'gatsby'
import fetch from 'node-fetch'

export default function SSRPage({ serverData }) {
  return (
    <Layout>
      <h1>Dogs!</h1>
      <ul>
        {Object.keys(serverData?.message).map((key) => (
          <li key={key}>
            <Link to={`/dogs/${key}`}>{key}</Link>
            {serverData.message[key].length ? (
              <ul>
                {serverData.message[key].map((subbreed) => (
                  <li>
                    <Link to={`/dogs/${key}/${subbreed}`}>{subbreed}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export async function getServerData() {
  try {
    const res = await fetch(`https://dog.ceo/api/breeds/list/all`)

    if (!res.ok) {
      throw new Error(`Response failed`)
    }

    return {
      props: await res.json(),
      headers: {
        // In SSR pages you can return arbitrary headers
        'x-dog': 'good',
      },
    }
  } catch (error) {
    return {
      headers: {
        status: 500,
      },
      props: {},
    }
  }
}
