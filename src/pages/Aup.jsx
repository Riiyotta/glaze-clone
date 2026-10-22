import { AUP_BLOCKS, AUP_TITLE } from '../data/legal/aup'
import LegalPage from './LegalPage'

export default function Aup() {
  return <LegalPage title={AUP_TITLE} blocks={AUP_BLOCKS} />
}
