import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { MARKET_ITEMS } from '../../logic/constants'
import { formatNumber } from '../../logic/utils'

const MarketView = () => {
  const [selectedTab, setSelectedTab] = useState('sell')
  const [activeFeedback, setActiveFeedback] = useState({}) // { [itemId]: { text, type, id } }
  const [balancePulse, setBalancePulse] = useState(null) // 'gain' | 'spend' | null

  const { money, wood, stone, plank, sellResource, buyResource } = useGameStore(state => ({
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    sellResource: state.sellResource,
    buyResource: state.buyResource
  }))

  const playerResources = {
    wood,
    stone,
    plank
  }

  const triggerFeedback = (itemId, text, type) => {
    const effectId = Date.now() + Math.random()
    setActiveFeedback(prev => ({
      ...prev,
      [itemId]: { text, type, id: effectId }
    }))
    setBalancePulse(type)

    setTimeout(() => {
      setActiveFeedback(prev => {
        if (prev[itemId]?.id === effectId) {
          const next = { ...prev }
          delete next[itemId]
          return next
        }
        return prev
      })
    }, 1200)

    setTimeout(() => {
      setBalancePulse(null)
    }, 600)
  }

  const handleSell = (item, amount) => {
    const res = sellResource(item.id, amount, item.sellPrice, item.name)
    if (res?.success) {
      triggerFeedback(item.id, `+$${formatNumber(res.earnings)}`, 'gain')
    }
  }

  const handleBuy = (item, amount) => {
    const res = buyResource(item.id, amount, item.buyPrice, item.name)
    if (res?.success) {
      triggerFeedback(item.id, `-$${formatNumber(res.cost)}`, 'spend')
    }
  }

  return (
    <div className="screen market-view">
      <div className="market-header">
        <div>
          <h1>City Market</h1>
          <p className="market-subtitle">
            Trade your manufactured goods for money or purchase raw construction supplies.
          </p>
        </div>
        <div className={`market-balance-pill ${balancePulse ? `pulse-${balancePulse}` : ''}`}>
          <span>💰 Cash: <strong>${formatNumber(money)}</strong></span>
        </div>
      </div>

      <div className="market-tabs">
        <Button
          variant={selectedTab === 'sell' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTab('sell')}
        >
          Sell Goods 💰
        </Button>
        <Button
          variant={selectedTab === 'buy' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTab('buy')}
        >
          Buy Supplies 🛒
        </Button>
      </div>

      <div className="market-content">
        {selectedTab === 'sell' ? (
          <div className="trade-section">
            <h2>Sell Your Manufactured Products</h2>
            <div className="market-grid">
              {Object.values(MARKET_ITEMS).map(item => {
                const currentAmount = Math.floor(playerResources[item.id] || 0)
                const totalValue = currentAmount * item.sellPrice
                const feedback = activeFeedback[item.id]

                return (
                  <div
                    key={item.id}
                    className={`market-card ${feedback ? `card-flash-${feedback.type}` : ''}`}
                  >
                    {feedback && (
                      <div className={`floating-trade-feedback ${feedback.type}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className="market-card-top">
                      <span className="market-item-icon">{item.icon}</span>
                      <div>
                        <h3>{item.name}</h3>
                        <p className="item-description">{item.description}</p>
                      </div>
                    </div>

                    <div className="market-card-stats">
                      <div className="stat-row">
                        <span>Sell Price:</span>
                        <strong className="text-success">${item.sellPrice} / unit</strong>
                      </div>
                      <div className="stat-row">
                        <span>In Storage:</span>
                        <strong>{formatNumber(currentAmount)} units</strong>
                      </div>
                      <div className="stat-row">
                        <span>Total Inventory Value:</span>
                        <strong>${formatNumber(totalValue)}</strong>
                      </div>
                    </div>

                    <div className="market-card-actions">
                      <Button
                        onClick={() => handleSell(item, 1)}
                        disabled={currentAmount < 1}
                      >
                        Sell 1 (+${item.sellPrice})
                      </Button>
                      <Button
                        onClick={() => handleSell(item, 10)}
                        disabled={currentAmount < 10}
                      >
                        Sell 10 (+${item.sellPrice * 10})
                      </Button>
                      <Button
                        onClick={() => handleSell(item, 50)}
                        disabled={currentAmount < 50}
                      >
                        Sell 50 (+${item.sellPrice * 50})
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleSell(item, currentAmount)}
                        disabled={currentAmount <= 0}
                      >
                        Sell All (+${formatNumber(totalValue)})
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="trade-section">
            <h2>Buy Construction Supplies</h2>
            <div className="market-grid">
              {Object.values(MARKET_ITEMS).map(item => {
                const currentStock = Math.floor(playerResources[item.id] || 0)
                const feedback = activeFeedback[item.id]

                return (
                  <div
                    key={item.id}
                    className={`market-card ${feedback ? `card-flash-${feedback.type}` : ''}`}
                  >
                    {feedback && (
                      <div className={`floating-trade-feedback ${feedback.type}`}>
                        {feedback.text}
                      </div>
                    )}

                    <div className="market-card-top">
                      <span className="market-item-icon">{item.icon}</span>
                      <div>
                        <h3>{item.name}</h3>
                        <p className="item-description">{item.description}</p>
                      </div>
                    </div>

                    <div className="market-card-stats">
                      <div className="stat-row">
                        <span>Buy Price:</span>
                        <strong className="text-warning">${item.buyPrice} / unit</strong>
                      </div>
                      <div className="stat-row">
                        <span>Current Stock:</span>
                        <strong>{formatNumber(currentStock)} units</strong>
                      </div>
                    </div>

                    <div className="market-card-actions">
                      <Button
                        onClick={() => handleBuy(item, 1)}
                        disabled={money < item.buyPrice}
                      >
                        Buy 1 (-${item.buyPrice})
                      </Button>
                      <Button
                        onClick={() => handleBuy(item, 10)}
                        disabled={money < item.buyPrice * 10}
                      >
                        Buy 10 (-${item.buyPrice * 10})
                      </Button>
                      <Button
                        onClick={() => handleBuy(item, 50)}
                        disabled={money < item.buyPrice * 50}
                      >
                        Buy 50 (-${item.buyPrice * 50})
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketView