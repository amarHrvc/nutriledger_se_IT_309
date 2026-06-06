import { defineConfig } from 'orval'

export default defineConfig({
  nutribase: {
    input: {
      target: 'http://localhost:8000/docs/api.json'
    },
    output: {
      target: './src/api/generated',
      client: 'fetch',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customFetch',
        },
      },
    }
  }
})
