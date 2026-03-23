import {AppNavigation} from "../shared/ui/AppNavigation/AppNavigation.tsx";


export const HomePage = () => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Interactive Video Platform</h1>
      <AppNavigation />
    </div>
  )
}