import StoreView from '../components/store/StoreView'

// /store and /store/:category share one template (SPEC_store 5).
export default function Store({ params }) {
  return <StoreView category={params.category || 'all'} />
}
