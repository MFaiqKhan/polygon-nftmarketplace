import '../styles/globals.css'
import Link from 'next/link' // Link is a component that is used to link to other pages

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'> 
        <p className='text-4xl font-bold'>NFT POLYGON MARKETPLACE</p>
        <div className='flex mt-4'>
          <Link href="/">
            <a className='mr-4 text-pink-500'>
              Home  
            </a>
          </Link>
          <Link href="/sell-item">
            <a className='mr-4 text-pink-500'>
              Sell Your Nft  
            </a>
          </Link>
          <Link href="/view-my-items">
            <a className='mr-4 text-pink-500'>
              View My Nfts  
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className='mr-4 text-pink-500'>
              Creator Dashboard 
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} /> 
    </div>
  )
}

export default MyApp
