import { useState } from 'react'
import Terminal from './components/Terminal'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState(null)
  const [slotMachineActive, setSlotMachineActive] = useState(false)
  const [slotReels, setSlotReels] = useState(['🍒', '🍋', '🍊'])
  const [slotSpinning, setSlotSpinning] = useState(false)
  const [slotReelSymbols, setSlotReelSymbols] = useState([
    ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐'],
    ['🍋', '🍊', '🍇', '🍉', '⭐', '💎'],
    ['🍊', '🍇', '🍉', '⭐', '💎', '7️⃣']
  ])

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
          <div className="slot-machine-container">
            <div className="slot-machine-title">🎰 CAÇA-NÍQUEL 🎰</div>
            <div className="slot-machine-reels">
              <div className={`slot-reel ${slotSpinning ? 'spinning' : ''}`}>
                <div className="slot-reel-strip">
                  {slotReelSymbols[0].map((symbol, idx) => (
                    <div key={idx} className="slot-symbol">{symbol}</div>
                  ))}
                  {/* Duplica para efeito infinito */}
                  {slotReelSymbols[0].map((symbol, idx) => (
                    <div key={`dup-${idx}`} className="slot-symbol">{symbol}</div>
                  ))}
                </div>
                {!slotSpinning && (
                  <div className="slot-reel-center">{slotReels[0]}</div>
                )}
              </div>
              <div className={`slot-reel ${slotSpinning ? 'spinning' : ''}`}>
                <div className="slot-reel-strip">
                  {slotReelSymbols[1].map((symbol, idx) => (
                    <div key={idx} className="slot-symbol">{symbol}</div>
                  ))}
                  {slotReelSymbols[1].map((symbol, idx) => (
                    <div key={`dup-${idx}`} className="slot-symbol">{symbol}</div>
                  ))}
                </div>
                {!slotSpinning && (
                  <div className="slot-reel-center">{slotReels[1]}</div>
                )}
              </div>
              <div className={`slot-reel ${slotSpinning ? 'spinning' : ''}`}>
                <div className="slot-reel-strip">
                  {slotReelSymbols[2].map((symbol, idx) => (
                    <div key={idx} className="slot-symbol">{symbol}</div>
                  ))}
                  {slotReelSymbols[2].map((symbol, idx) => (
                    <div key={`dup-${idx}`} className="slot-symbol">{symbol}</div>
                  ))}
                </div>
                {!slotSpinning && (
                  <div className="slot-reel-center">{slotReels[2]}</div>
                )}
              </div>
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
        />
      </div>
    </div>
  )
}

export default App
