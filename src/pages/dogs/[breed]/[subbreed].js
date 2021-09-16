import * as React from 'react'
import { Layout } from '../../../layout/default'
import fetch from 'node-fetch'
import { Link } from 'gatsby'

const SSRPage = ({ serverData }) => {
  console.log({ serverData })
  const { breed, subbreed, images } = serverData
  return (
    <Layout>
      <h1>
        SSR Page with a random {subbreed} {breed}
      </h1>
      <img alt={breed} src={images?.message[0]} />
    </Layout>
  )
}

export default SSRPage

export async function getServerData({ params }) {
  try {
    const imageReq = await fetch(
      `https://dog.ceo/api/breed/${params.breed}/${params.subbreed}/images/random/6`
    )
    if (!imageReq.ok) {
      throw new Error(`Response failed`)
    }

    const images = await imageReq.json()

    return {
      props: {
        images,
        ...params,
      },
      headers: {
        'x-dog': 'good',
      },
    }
  } catch (error) {
    console.error(error)
    return {
      headers: {
        status: 500,
      },
      props: {},
    }
  }
}
