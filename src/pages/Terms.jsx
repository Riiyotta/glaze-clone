import { TERMS_BLOCKS, TERMS_TITLE } from '../data/legal/terms'
import LegalPage from './LegalPage'

export default function Terms() {
  return <LegalPage title={TERMS_TITLE} blocks={TERMS_BLOCKS} />
}
