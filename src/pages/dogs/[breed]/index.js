import * as React from 'react'
import { Layout } from '../../../layout/default'
import fetch from 'node-fetch'
import { Link } from 'gatsby'

const SSRPage = ({ serverData }) => {
  console.log({ serverData })
  const { breed } = serverData
  return (
    <Layout>
      <h1>SSR Page with a random {breed}</h1>
      <img alt={breed} src={serverData.images?.message} />

      {serverData.breeds.length ? (
        <>
          <h2>Some more types of {breed}</h2>
          <ul>
            {serverData.breeds.map((subbreed) => (
              <li>
                <Link to={`/dogs/${breed}/${subbreed}`}>
                  {subbreed} {breed}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Layout>
  )
}

export default SSRPage

export async function getServerData({ params }) {
  try {
    const imageReq = await fetch(
      `https://dog.ceo/api/breed/${params.breed}/images/random`
    )
    if (!imageReq.ok) {
      throw new Error(`Response failed`)
    }

    const breedReq = await fetch(`https://dog.ceo/api/breeds/list/all`)
    if (!breedReq.ok) {
      throw new Error(`Response failed`)
    }

    const breeds = await breedReq.json()
    const images = await imageReq.json()

    return {
      props: {
        images,
        breeds: breeds.message?.[params.breed] || [],
        breed: params.breed,
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
