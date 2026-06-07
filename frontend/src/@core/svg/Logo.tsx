// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1.25em' height='1.25em' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect width='32' height='32' rx='8' fill='currentColor' />
      <text
        x='16'
        y='21.5'
        textAnchor='middle'
        fill='white'
        fontSize='13'
        fontWeight='700'
        fontFamily='system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        letterSpacing='-0.5'
      >
        NL
      </text>
    </svg>
  )
}

export default Logo
