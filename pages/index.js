import { useState, useRef, useEffect } from 'react'
import styles from '../styles/Home.module.css'

function ScrollToBottom() {
  const elementRef = useRef()
  useEffect(() => elementRef.current.scrollIntoView())

  return <div ref={elementRef} />
}

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')
  const [isERC, setIsERC] = useState('yes')
  const [startTokenId, setStartTokenId] = useState('')
  const [endTokenId, setEndTokenId] = useState('')

  function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const runRefresh = async () => {
    try {
      for (let i = Number(startTokenId); i <= Number(endTokenId); i++) {
        if (i !== 0 && i % 15 === 0) {
          console.log("wait for 30s to prevent opensea's server overload")
          await pause(30000)
        }

        const res = await fetch('api/opensea-refresh', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ contractAddress, isERC, tokenId: i })
        })

        const data = await res.json()
        console.log('tokenId ' + i + ' finished')
      }

      console.log('All done')
    } catch (error) {
      console.log('Error when fetching api ', error)
    }
  }

  return (
    <div className={styles.container}>
      <div>
        <label htmlFor='contract'>contract address</label>
        <input
          type='text'
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor='contract'>start token id</label>
        <input
          type='text'
          value={startTokenId}
          onChange={(e) => setStartTokenId(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor='contract'>end token id</label>
        <input
          type='text'
          value={endTokenId}
          onChange={(e) => setEndTokenId(e.target.value)}
        />
      </div>
      <button onClick={runRefresh}>Run</button>
    </div>
  )
}
