import * as React from 'react'
import { Link } from 'gatsby'
import { headerCss, titleCss } from './default.module.css'

export function Layout({ children }) {
  return (
    <>
      <header className={headerCss}>
        <h1 className={titleCss}>
          <Link to="/">Gatsby 4 Demo</Link>
        </h1>
      </header>
      <main>{children}</main>
    </>
  )
}
