import { PRIVACY_BLOCKS, PRIVACY_TITLE } from '../data/legal/privacy'
import LegalPage from './LegalPage'

export default function Privacy() {
  return <LegalPage title={PRIVACY_TITLE} blocks={PRIVACY_BLOCKS} />
}
