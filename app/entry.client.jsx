//import { hydrate } from 'react-dom'
import { hydrateRoot } from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'

hydrateRoot(document, <RemixBrowser />)