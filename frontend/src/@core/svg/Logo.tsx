// React Imports
import type { SVGAttributes } from 'react'

const heartPath =
  'M16 23 C16 23 8 17 8 12 C8 8.5 10.5 6.5 13 6.5 C14.5 6.5 15.5 7.25 16 8.5 C16.5 7.25 17.5 6.5 19 6.5 C21.5 6.5 24 8.5 24 12 C24 17 16 23 16 23 Z'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1.25em' height='1.25em' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect width='32' height='32' rx='8' fill='currentColor' />
      <path d={heartPath} fill='white' />
    </svg>
  )
}

export default Logo
