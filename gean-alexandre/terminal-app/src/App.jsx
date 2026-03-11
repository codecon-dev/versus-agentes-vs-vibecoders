import { useState } from 'react'
import Terminal from './components/Terminal'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState(null)
  const [slotMachineActive, setSlotMachineActive] = useState(false)
  const [slotReels, setSlotReels] = useState(['🍒', '🍋', '🍊'])
  const [slotSpinning, setSlotSpinning] = useState(false)
  const [slotWon, setSlotWon] = useState(false)
  const [slotReelSymbols, setSlotReelSymbols] = useState([
    ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐'],
    ['🍋', '🍊', '🍇', '🍉', '⭐', '💎'],
    ['🍊', '🍇', '🍉', '⭐', '💎', '7️⃣']
  ])
  const [apiSymbols, setApiSymbols] = useState([])

  const getSymbolImage = (name) => {
    const symbol = apiSymbols.find(s => s.name === name)
    if (symbol && symbol.image) {
      return <img src={symbol.image} alt={name} className="slot-symbol-img" />
    }
    return name
  }

  const handleCommandExecuted = () => {
    // Gera uma imagem aleatória usando Picsum Photos apenas se a máquina não estiver ativa
    if (!slotMachineActive) {
      const randomId = Math.floor(Math.random() * 1000)
      const newImageUrl = `https://picsum.photos/seed/${randomId}/1920/1080`
      setImageUrl(newImageUrl)
    }
  }

  return (
    <div className="app">
      <div className="image-viewer">
        {slotMachineActive ? (
          <div className={`slot-machine-container ${slotWon ? 'jackpot-win' : ''}`}>
            <div className={`slot-machine-title ${slotWon ? 'jackpot-title' : ''}`}>🎰 CAÇA-NÍQUEL 🎰</div>
            <div className={`slot-machine-reels ${slotWon ? 'jackpot-reels' : ''}`}>
              {[0, 1, 2].map(reelIdx => (
                <div key={reelIdx} className={`slot-reel ${slotSpinning ? 'spinning' : ''} ${slotWon ? 'jackpot-reel' : ''}`}>
                  <div className="slot-reel-strip">
                    {slotReelSymbols[reelIdx].map((symbol, idx) => (
                      <div key={idx} className="slot-symbol">{getSymbolImage(symbol)}</div>
                    ))}
                    {slotReelSymbols[reelIdx].map((symbol, idx) => (
                      <div key={`dup-${idx}`} className="slot-symbol">{getSymbolImage(symbol)}</div>
                    ))}
                  </div>
                  {!slotSpinning && (
                    <div className={`slot-reel-center ${slotWon ? 'jackpot-symbol' : ''}`}>{getSymbolImage(slotReels[reelIdx])}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="slot-machine-instructions">
              Digite "spin" no terminal para girar os rolos
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Resultado do comando"
            className="viewer-image"
          />
        ) : (
          <div className="viewer-placeholder">
            <p>Execute um comando no terminal para ver o resultado aqui</p>
          </div>
        )}
      </div>
      <div className="terminal-section">
        <Terminal
          onCommandExecuted={handleCommandExecuted}
          slotMachineActive={slotMachineActive}
          setSlotMachineActive={setSlotMachineActive}
          slotReels={slotReels}
          setSlotReels={setSlotReels}
          slotSpinning={slotSpinning}
          setSlotSpinning={setSlotSpinning}
          slotReelSymbols={slotReelSymbols}
          setSlotReelSymbols={setSlotReelSymbols}
          slotWon={slotWon}
          setSlotWon={setSlotWon}
          apiSymbols={apiSymbols}
          setApiSymbols={setApiSymbols}
        />
      </div>
    </div>
  )
}

export default App
